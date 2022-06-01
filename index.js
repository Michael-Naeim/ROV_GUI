/*------------------------------merge------------------------------*/
const dgram = require('dgram');
const protobuf = require('protocol-buffers');
const fs = require('fs');
var messages = protobuf(fs.readFileSync('data.proto'))

// server ip and port
const port = 5555;
const address = '192.168.1.20';
const cltAddress = '192.168.1.15';
const cltport = 5555;
// create a socket connection 
const server = dgram.createSocket('udp4');

server.bind({
  address: address,
  port: port,
  exclusive: false,
});


var speeds = [];
var directions = [];
var servoSpeeds = [0,0,0];
var dcmotorSpd = [0,0,0,0];
var solenoid = 1;
var pitchAngle = 0;

var i = 0;
while (i < 30) {
  var y = messages.motors.encode({
    motorsSpeed: speeds,
    motorsDirections: directions,
    servos: servoSpeeds,
    solenoidDirection: solenoid
  })
  messages.motors.decode(y);
  var x = messages.Sensor.encode({
    imu: [255.5]
  })
  messages.Sensor.decode(x);
  i++;
}

// pid gain numbers
var kpYaw = 1;
var kiYaw = 0;
var kdYaw = 0;
// var kpRoll;
// var kiRoll;
// var kdRoll;
var kpPitch = 1;
var kiPitch = 0;
var kdPitch = 0;

class PID {
  constructor(pKP, pKD, pKI) {
    this.kp = pKP;
    this.ki = pKI;
    this.kd = pKD;
    this.proportional;
    this.integral;
    this.derivative;
    this.error;
    this.lastError = 0;
    this.zeroAngle = 0;
    this.target = 0;
    this.correction;
    this.axisReading;
    this.lastTarget = 0;
    this.stickAngle = 0;
    this.lastFusedReading = 0;
    this.resetZeroAngle = false;
  }

  setTargetAbsolute(xAXIS, yAXIS) {
    // forward,backward, left, right or stick is stationary
    if (xAXIS == 0 || yAXIS == 0) {
      // pilot could start moving forward while target is not yet achieved
      // a better approach is to use the last reading provided by the IMU
      this.target = this.zeroAngle;
      return this.target;
    }

    // get angle using Tan theta = y / x
    this.stickAngle = Math.abs(Math.atan(yAXIS / xAXIS));
    this.zeroAngle = this.lastFusedReading;

    // Checking quadrant
    if (xAXIS > 0 && yAXIS > 0) {
      // 1st quadrant
      this.target = this.stickAngle;
    } else if (xAXIS < 0 && yAXIS > 0) {
      // 2nd quadrant
      this.target = this.stickAngle + 90;
    } else if (xAXIS < 0 && yAXIS < 0) {
      // 3rd quadrant
      this.target = this.stickAngle + 180;
    } else {
      // 4th quadrant
      this.target = this.stickAngle + 270;
    }

    return this.target;
  }

  setTargetRelative(xAXIS, yAXIS) {
    // is stationary or moving in one of the four main axises
    if (xAXIS == 0 || yAXIS == 0) {
      if (this.resetZeroAngle) {
        // the north angle resets to the last imu reading while stationary
        this.zeroAngle = this.lastFusedReading;
        // only happens once to keep a consistent angle
        this.resetZeroAngle = false;
      }
      this.target = this.zeroAngle;
    } else {
      // get angle using Tan theta = y / x
      this.stickAngle = Math.abs(Math.atan(yAXIS / xAXIS));
      this.resetZeroAngle == true;

      // Checking quadrant
      if (xAXIS > 0 && yAXIS > 0) {
        // 1st quadrant
        this.stickAngle *= -1;
      } else if (xAXIS < 0 && yAXIS > 0) {
        // 2nd quadrant
      } else if (xAXIS < 0 && yAXIS < 0) {
        // 3rd quadrant
        this.stickAngle += 90;
      } else {
        // 4th quadrant
        this.stickAngle += 90;
        this.stickAngle *= -1;
      }

      this.target = this.stickAngle + this.zeroAngle;
      while (this.target >= 360) {
        this.target -= 360;
      }

      while (this.target < 0) {
        this.target += 360;
      }
    }
    return this.target;
  }

  getCorrection(target, fusedReading, maxError = 0) {
    // reading are kept in 360 as direction is determined by quadrant
    while (fusedReading >= 360) {
      fusedReading -= 360;
    }

    while (fusedReading < 0) {
      fusedReading += 360;
    }

    if (target > 270 && fusedReading < 90) {
      fusedReading += 360;
    } else if (target < 90 && fusedReading > 270) {
      target += 360;
    }

    this.error = target - fusedReading;
    // If error is less than a specific threshold, do nothing
    if (Math.abs(this.error) <= maxError) {
      this.correction = 0;
    } else {
      this.proportional = this.error * this.kp;
      this.integral = (this.error + this.lastError) * this.ki;
      this.derivative = (this.error - this.lastError) * this.kd;
      this.correction = Math.floor(this.proportional + this.integral + this.derivative);
    }
    this.lastFusedReading = fusedReading;
    this.lastError = this.error;
    return this.correction;
  }

  getStickAngle (xAXIS, yAXIS) {
    this.stickAngle = Math.abs(Math.atan(yAXIS / xAXIS));

    // Checking quadrant
    if (xAXIS > 0 && yAXIS > 0) {
      // 1st quadrant
      this.stickAngle *= -1;
    } else if (xAXIS > 0 && yAXIS < 0) {
      // 2nd quadrant
      this.stickAngle *= -1;
    }

    return this.stickAngle;
  }
}

// creating a new PID object for each axis
const pidYaw = new PID(kpYaw, kiYaw, kdYaw);
const pidPitch = new PID(kpPitch, kiPitch, kdPitch);

/*------------------merge------------------*/
window.addEventListener("gamepadconnected", function(e) {
  // hide text that says connect the joystick
  document.getElementById("show_on_off").style.display="none";

  console.log("Gamepad connected")
});

window.addEventListener("gamepaddisconnected", function(e) {
  
  document.querySelector(".my_show_on_off_joystick").style.display="block";
  console.log("Gamepad disconnected ")
});

function update() {
  let motorsBaseSpeed = document.getElementById('s3-3').value;
  let servosBaseSpeed = document.getElementById('s3-4').value;
  // console.log(servosBaseSpeed);
  let th = [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0]
  ];
  //TR, TL, BR, BL
  const gamepads = navigator.getGamepads()
  if (gamepads[0]) {
    var gamepadState = {
      id: gamepads[0].id,
      axes: [],
      buttons: []
    }
    for (var i in gamepads[0].axes) {
      gamepadState['axes'].push(gamepads[0].axes[i].toFixed(2));
    }
    for (var i in gamepads[0].buttons) {
      var aloooo = "button_" + i
      let a = {}
      a[aloooo] = gamepads[0].buttons[i].pressed;
      // console.log(aloooo);
      gamepadState['buttons'].push(a);
    }
    // gamepadDisplay.textContent = JSON.stringify(gamepadState, null, 2)
    //
    // for (var i=0, i<=c, i+=2){
    //
    // }
    let th1 = [];
    let th2 = [];
    let th3 = [];
    let th4 = [];

    // movments = { forward: [0, 0, 1, 1], sh_right: [0, 1, 0, 1], r_right: [1, 0, 0, 1]}
    movments = [
      [0, 0, 1, 1],
      [0, 1, 0, 1],
      [1, 0, 0, 1]
    ]
    //          FORWARD      SHIFTING RIGHT  ROTATE_RIGHT

    var x1 = (gamepads[0].axes[0].toFixed(2)) * 255;
    var y1 = (gamepads[0].axes[1].toFixed(2)) * 255;
    var x2 = (gamepads[0].axes[2].toFixed(2)) * 255;

    if (gamepads[0].axes[3].toFixed(2) != 0) {
      th[4][0] = Math.abs((gamepads[0].axes[3].toFixed(2)) * 400) + 1500;
      th[4][1] = (gamepads[0].axes[3].toFixed(2) > 0) ? 0 : 1;
      th[5][0] = Math.abs((gamepads[0].axes[3].toFixed(2)) * 400) + 1500;
      th[5][1] = (gamepads[0].axes[3].toFixed(2) > 0) ? 0 : 1;
    }
    // let ActiveAxis = (Math.abs(x1)>Math.abs(y1)) ? X:Y;
    let ActiveAxis = Math.max(Math.abs(x1), Math.abs(y1));
    let DirAxis = [0, 0, 0, 0]

    if (ActiveAxis != 0) {
      if (ActiveAxis == Math.abs(x1)) {
        DirAxis = (x1 > 0) ? movments[1] : movments[1].map(function(mov) {
          return !mov ? 1 : 0
        });
      } else {
        DirAxis = (y1 > 0) ? movments[0] : movments[0].map(function(mov) {
          return !mov ? 1 : 0
        });
      }
    } else if (x2 != 0) {
      ActiveAxis = Math.abs(x2)
      DirAxis = (x1 > 0) ? movments[2] : movments[2].map(function(mov) {
        return !mov ? 1 : 0
      });
    }

    for (let i = 0; i < DirAxis.length; i++) {
      th[i][1] = DirAxis[i]
      th[i][0] = ActiveAxis
    }

    var errorRange = 0.45;
    gamepadState.axes[1] = 0 - gamepadState.axes[1];

    if (gamepadState.axes[1] > 0 && gamepadState.axes[1] <= errorRange) {
      gamepadState.axes[1] = 0
    } else if (gamepadState.axes[1] < 0 && gamepadState.axes[1] >= -errorRange) {
      gamepadState.axes[1] = 0
    }

    if (gamepadState.axes[0] > 0 && gamepadState.axes[0] <= errorRange) {
      gamepadState.axes[0] = 0
    } else if (gamepadState.axes[0] < 0 && gamepadState.axes[0] >= -errorRange) {
      gamepadState.axes[0] = 0
    }

    // console.log(gamepadState);

    /*------------------merge------------------*/
    server.on('message', (msg, rinfo) => {
      var sensorIn = messages.Sensor.decode(msg);

      /*------------------buttons------------------*/

      // servo arm opens and closes with l1 and l2
      if (gamepadState.buttons[4]) {
        servosBaseSpeed[0] = 1900;
      } else if (gamepadState.buttons[5]) {
        servosBaseSpeed[0] = 1100;
      } else {
        servosBaseSpeed[0] = 1500;
      }

      // pneumatic opens with x button
      if (gamepadState.buttons[0] != 0) {
        solenoid = !solenoid;
      }

      // ROV pitch angle increases with up arrow and decreases with down arrow
      if (gamepadState.buttons[12]) {
        servoSpeeds[1] += 15;
        servoSpeeds[2] += 15;
      }
      if (gamepadState.buttons[13]) {
        servoSpeeds[1] -= 15;
        servoSpeeds[2] -= 15;
      }

      // turn left or right on center axis by
      // flicking right stick left or right
      // if (gamepadState.axes[2] > 0.3) {
      //   pidYaw.zeroAngle += 10
      // } else if (gamepadState.axes[2] < -0.3) {
      //   pidYaw.zeroAngle -= 10
      // }

      // go up or down on center axis by
      // flicking right stick up or down
      if (gamepadState.axes[3] > 0.35) {
        servoSpeeds[1] = 1800;
        servoSpeeds[2] = 1800;
        // var skip_pid = true;
      } else if (gamepadState.axes[3] < -0.35) {
        servoSpeeds[1] = 1200;
        servoSpeeds[2] = 1200;
        // skip_pid = true;
      } else {
        servoSpeeds[1] = 1500;
        servoSpeeds[2] = 1500;
      }
      /*------------------buttons------------------*/

      motorsBaseSpeed = Math.abs(motorsBaseSpeed);

      // left right correction
      // pidYaw.getCorrection(pidYaw.setTargetRelative(gamepadState.axes[0], gamepadState.axes[1]), sensorIn[0], 3);
      // for (var i = 0; i < 2; i++) {
      //   if (motorsBaseSpeed + pidYaw.correction > 255) {
      //     speeds[i] = 255;
      //     speeds[i + 2] = 255;
      //   } else if (motorsBaseSpeed + pidYaw.correction < 0) {
      //     speeds[i] = 255;
      //     speeds[i + 2] = 255;
      //   } else {
      //     speeds[i] = motorsBaseSpeed + pidYaw.correction;
      //     speeds[i + 2] = motorsBaseSpeed + pidYaw.correction;
      //   }
      //   pidYaw.correction *= -1;
      // }
      //
      // // up down correction
      // // if (!skip_pid) {
      // pidPitch.getCorrection(pitchAngle, sensorIn[1], 0);
      // for (var i = 1; i < 3; i++) {
      //   if (servosBaseSpeed + pidPitch.correction > 1900) {
      //     servoSpeeds[i] = 1900;
      //   } else if (servosBaseSpeed + pidPitch.correction < 1100) {
      //     servoSpeeds[i] = 1100;
      //   } else {
      //     servoSpeeds[i] = servosBaseSpeed + pidPitch.correction;
      //   }
      //   pidPitch.correction *= -1;
      // }

      //pidYaw.getStickAngle(gamepadState.axes[0], gamepadState.axes[1]);

      // movments = { forward: [0, 0, 1, 1], sh_right: [0, 1, 0, 1], r_right: [1, 0, 0, 1]}
      // get directions
      if (gamepadState.axes[0] == 0 && gamepadState.axes[1] == 0) {
        if (gamepadState.axes[2] == 0) {
          speeds = [0, 0, 0, 0];
        } else {
          (gamepadState.axes[2] > 0) ? directions = [1, 0, 0, 1]: directions = [0, 1, 1, 0];
          speeds = [motorsBaseSpeed, motorsBaseSpeed, motorsBaseSpeed, motorsBaseSpeed];
        }
      } else if (gamepadState.axes[1] == 0) {
        (gamepadState.axes[0] > 0) ? directions =  [0, 1, 0, 1]: directions = [1, 0, 1, 0];
        speeds = [motorsBaseSpeed, motorsBaseSpeed, motorsBaseSpeed, motorsBaseSpeed]
      } else if (gamepadState.axes[0] == 0) {
        (gamepadState.axes[1] > 0) ? directions = [0, 0, 1, 1]: directions = [1, 1, 0, 0];
        speeds = [motorsBaseSpeed, motorsBaseSpeed, motorsBaseSpeed, motorsBaseSpeed]
      } else {
        (pidYaw.stickAngle < 0) ? directions = [1, 0, 0, 1]: directions = [0, 1, 1, 0];
        speeds = [motorsBaseSpeed, motorsBaseSpeed, motorsBaseSpeed, motorsBaseSpeed]
      }
      var motorsOut = messages.motors.encode({
        motorsSpeed: speeds,
        motorsDirections: DirAxis,
        servos: servoSpeeds,
        solenoidDirection: solenoid
      });
      // }
      //server.send(Buffer.from(motorsOut), cltport, cltAddress);
    });
    /*------------------test------------------*/
    //pidYaw.getStickAngle(gamepadState.axes[0], gamepadState.axes[1]);

    // get directions
    if (gamepadState.axes[0] == 0 && gamepadState.axes[1] == 0) {
      if (gamepadState.axes[2] == 0) {
        speeds = [0, 0, 0, 0];
        directions = ['still'];
      } else {
        (gamepadState.axes[2] > 0) ? directions = ['ROTATE_RIGHT']: directions = ['ROTATE_LEFT'];
        var spd = Math.abs(parseInt(gamepadState.axes[2] *parseInt(motorsBaseSpeed)))
      speeds = [spd,spd,spd,spd]
      }
    } else if (gamepadState.axes[1] == 0) {
      (gamepadState.axes[0] > 0) ? directions = ['SHIFT_RIGHT']: directions = ['SHIFT_LEFT'];
      var spd = Math.abs(parseInt(gamepadState.axes[0] *parseInt(motorsBaseSpeed)))
      speeds = [spd,spd,spd,spd]
    } else if (gamepadState.axes[0] == 0) {
      (gamepadState.axes[1] > 0) ? directions = ['forward']: directions = ['backward'];
      var spd = Math.abs(parseInt(gamepadState.axes[1] *parseInt(motorsBaseSpeed)))
      speeds = [spd,spd,spd,spd]
    } else {
      (pidYaw.stickAngle < 0) ? directions = ['ROTATE_RIGHT']: directions = ['ROTATE_LEFT'];
      speeds = [motorsBaseSpeed, motorsBaseSpeed, motorsBaseSpeed, motorsBaseSpeed]
    }

    // servo arm opens and closes with l1 and l2
    if (gamepadState.buttons[4] > 0) {
      servosBaseSpeed[0] = 1900;
    } else if (gamepadState.buttons[5]) {
      servosBaseSpeed[0] = 1100;
    } else {
      servosBaseSpeed[0] = 1500;
    }

    // pneumatic opens with x button
    if (gamepadState.buttons[0] > 0) {
      solenoid = !solenoid;
    }

    // ROV pitch angle increases with up arrow and decreases with down arrow
    if (gamepadState.buttons[12] > 0) {
      servoSpeeds[1] += 15;
      servoSpeeds[2] += 15;
    }
    if (gamepadState.buttons[13] > 0) {
      servoSpeeds[1] -= 15;
      servoSpeeds[2] -= 15;
    }

    // turn left or right on center axis by
    // flicking right stick left or right
    if (gamepadState.axes[2] > 0.3) {
      dcmotorSpd[0] = 100;
      dcmotorSpd[1] = 0;
    } else if (gamepadState.axes[2] < -0.3) {
      dcmotorSpd[2] = 100;
      dcmotorSpd[3] = 0;
    } else if (gamepadState.axes[2] == 0) {
      dcmotorSpd[0];
      dcmotorSpd[1];
      dcmotorSpd[2];
      dcmotorSpd[3];
    }

    // go up or down on center axis by
    // flicking right stick up or down
    if (gamepadState.axes[3] > 0.35) {
      servoSpeeds[2] = 1200;
      servoSpeeds[1] = 1200;
      // var skip_pid = true;
    } else if (gamepadState.axes[3] < -0.35) {
      servoSpeeds[2] = 1800;
      servoSpeeds[1] = 1800;
      // skip_pid = true;
    } else {
      servoSpeeds[2] = 1500;
      servoSpeeds[1] = 1500;
    }
    // if(gamepadState.buttons[2].button_2)
    // {
    //   dcmotorSpd[0]=255;
    //   dcmotorSpd[1]=0;
    // }
    // else
    // {
    //   dcmotorSpd[0]=0;
    //   dcmotorSpd[1]=0;
    // }
    // if(gamepadState.buttons[1].button_1)
    // {
    //   dcmotorSpd[0]=0;
    //   dcmotorSpd[1]=255;
    // }
    // else
    // {
    //   dcmotorSpd[0]=0;
    //   dcmotorSpd[1]=0;
    // }
//    console.log(directions);
//    console.log(gamepadState.buttons);
var motorsOut = messages.motors.encode({
  motorsSpeed: speeds,
  motorsDirections: DirAxis,
  servos: servoSpeeds,
  solenoidDirection: solenoid,
  dcMotors: dcmotorSpd
});
// }
      server.send(Buffer.from(motorsOut), cltport, cltAddress);
      console.log(messages.motors.decode(motorsOut));
      // console.log("Speed" + " : " + speeds + ",  Directions : " + directions  + ",  Thrusters : " + servoSpeeds  );
    /*------------------test------------------*/
  }
  window.requestAnimationFrame(update)
}

window.requestAnimationFrame(update)
