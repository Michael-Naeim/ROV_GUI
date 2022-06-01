var dgram = require('dgram');
var protobuf = require('protocol-buffers')
var fs = require('fs');
// pass a proto file as a buffer/string or pass a parsed protobuf-schema object
var messages = protobuf(fs.readFileSync('data.proto'))

// messages recived from the joystick
var x;
var y;
var motorsBaseSpeed;
var servosBaseSpeed;
var pitchAngle;

// motor reuired arrays recived from the joystick
var speeds = [];
var directions = [];
var servoSpeeds = [];
var solenoid;

// server ip and port
const port = 5555;
const address = '192.168.1.0';

 var i = 0;
// iterates through messages as protobuf 1st loop theough
// being either encode or decode is always slow [0.523 ms]
// for some reason while loop [0.02 ms] yields better results than a for loop [0.1 ms]
while (i < 30) {
  var y = messages.motors.encode({
    motorsSpeed: speeds,
    motorsDirections: directions,
    servos: servo
  })
  messages.motors.decode(y);
  var x = messages.Sensor.encode({
    imu: [255.5]
  })
  messages.Sensor.decode(x);
  i++;
}

// pid gain numbers
var kpYaw;
var kiYaw;
var kdYaw;
// var kpRoll;
// var kiRoll;
// var kdRoll;
var kpPitch;
var kiPitch;
var kdPitch;

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
      if (this.resetZeroAngle == true) {
        // the north angle resets to the last imu reading while stationary
        this.zeroAngle = this.lastFusedReading;
        // only happens once to keep a consistent angle
        this.resetZeroAngle = false;
      }
      this.target = this.zeroAngle;
      return this.target;
    }

    // get angle using Tan theta = y / x
    this.stickAngle = Math.abs(Math.atan(yAXIS / xAXIS));
    this.resetZeroAngle == true;

    // Checking quadrant
    if (xAXIS > 0 && yAXIS > 0) {
      // 1st quadrant
      this.target = -this.stickAngle;
    } else if (xAXIS < 0 && yAXIS > 0) {
      // 2nd quadrant
      this.target = -(this.stickAngle + 90);
    } else if (xAXIS < 0 && yAXIS < 0) {
      // 3rd quadrant
      this.target = this.stickAngle;
    } else {
      // 4th quadrant
      this.target = this.stickAngle + 90;
    }

    this.target = this.target + this.zeroAngle;
    while (this.target >= 360) {
      this.target -= 360;
    }

    while (this.target < 0) {
      this.target += 360;
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

    // 4th quadrant is quite tricky as both first and second quadrants angles
    // are always less than thier counterpart in the 4th one
    // so system could overshoot and direction will be the same both ways
    // so solution is incrementing the 1st quadrant readings
    if (target > 270 && fusedReading < 90) {
      fusedReading += 360;
    }
    // same goes for first quadrant as both fourth and second quadrants angles
    // are always greater than thier counterpart in the 1st one
    // so system could overshoot and direction will be the same both ways
    // so solution is incrementing the 1st quadrant readings
    else if (target < 90 && fusedReading > 270) {
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
}

// creating a new PID object for each axis
const pidYaw = new PID(kpYaw, kiYaw, kdYaw);
// const pidRoll = new PID(kpRoll, kiRoll, kdRoll);
const pidPitch = new PID(kpPitch, kiPitch, kdPitch);

// create a socket connection
const server = dgram.createSocket('udp4');

// server.bind([5555], ['192.168.1.0']);
server.bind({
  address: address,
  port: port,
  exclusive: false,
});

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});
 while (true) {
  server.on('message', (msg, rinfo) => {
    var sensorIn = messages.Sensor.decode(msg);
    /* -------------------fuse the sensor---------------------------*/
    pidYaw.getCorrection(pidYaw.setTargetRelative(x, y), sensorIn[0], 3)
    pidPitch.getCorrection(pitchAngle, sensorIn[1], 0)
    for (var i = 0; i < 2; i++) {
      if (motorsBaseSpeed + pidYaw.correction > 255) {
        speeds[i] = 255;
        speeds[i + 2] = 255;
      } else if (motorsBaseSpeed + pidYaw.correction < 0) {
        speeds[i] = 0;
        speeds[i + 2] = 0;
      } else {
        speeds[i] = motorsBaseSpeed + pidYaw.correction;
        speeds[i + 2] = motorsBaseSpeed + pidYaw.correction;
      }
      pidYaw.correction *= -1;
    }
    for (var i = 1; i < 3; i++) {
      if (servosBaseSpeed + pidPitch.correction > 1900) {
        servoSpeeds[i] = 1900;
      } else if (servosBaseSpeed + pidPitch.correction < 1100) {
        servoSpeeds[i] = 1100;
      } else {
        servoSpeeds[i] = servosBaseSpeed + pidPitch.correction;
      }
      pidPitch.correction *= -1;
    }
    var motorsOut = messages.motors.encode({
      motorsSpeed: speeds,
      motorsDirections: directions,
      servos: servoSpeeds,
      solenoidDirection: solenoid
    });
    server.send(motorsOut, rinfo.port, rinfo.address);

  });
}
