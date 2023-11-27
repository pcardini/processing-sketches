let lines = []; // List to store multiple lines
let currentLine; // The line currently being drawn

function setup() {
    // Adjust the size to fit the window, considering potential scrollbar width/height
    let canvas = createCanvas(windowWidth - 5, windowHeight - 5);
    canvas.style('display', 'block'); // This prevents any extra space around the canvas that might cause scrollbars
    background(245, 159, 190); // Set background color
}

function draw() {
    for (let line of lines) {
        line.display(); // Display each line
    }

    if (currentLine != null) {
        currentLine.addPoint(createVector(mouseX, mouseY)); // Add points to current line
        currentLine.displayTemporary(); // Display the current line being drawn
    }
}

function windowResized() {
    // Adjust the canvas size on window resize
    resizeCanvas(windowWidth - 5, windowHeight - 5);
    background(245, 159, 190); // Reset the background
}

function mousePressed() {
    currentLine = new Line(); // Start a new line
}

function mouseReleased() {
    currentLine.calculateCentroid(); // Calculate centroid for the line
    currentLine.startRotating(); // Start rotating the line
    lines.push(currentLine); // Add the completed line to the list
    currentLine = null; // Reset current line
}


class Line {
  constructor() {
    this.points = []; // Points of the line
    this.strokeWeights = []; // Stroke weights for each segment
    this.centroid = createVector(); // Centroid of the line
    this.shouldRotate = false; // Flag to indicate if the line should rotate
    this.angle = 0; // Rotation angle
    this.rotationDirection = random(1) < 0.5 ? -1 : 1; // Randomly assign rotation direction
    this.lineColor = this.getColor(mouseX, mouseY); // Set line color based on initial position
  }

  addPoint(point) {
    this.points.push(point);

    if (this.points.length >= 2) {
      let lastPoint = this.points[this.points.length - 2];
      let distance = p5.Vector.dist(lastPoint, point);

      // Ensure thicker stroke for slower movement
      let weight = map(distance, 0, 30, 10, 0.5);
      this.strokeWeights.push(weight);
    }
  }

  calculateCentroid() {
    let sumX = 0;
    let sumY = 0;
    for (let v of this.points) {
      sumX += v.x;
      sumY += v.y;
    }
    this.centroid = createVector(sumX / this.points.length, sumY / this.points.length);
  }

  startRotating() {
    this.shouldRotate = true;
  }

  display() {
    push();
    translate(this.centroid.x, this.centroid.y);
    if (this.shouldRotate) {
      rotate(this.angle * this.rotationDirection);
      this.angle += 0.005;
    }
    this.drawLine();
    pop();
  }

  displayTemporary() {
    this.drawLine();
  }

  drawLine() {
    noFill();
    stroke(this.lineColor);

    for (let i = 0; i < this.points.length; i++) {
      if (i > 0) {
        let weight = this.strokeWeights[i];
        strokeWeight(weight);

        let start = this.points[i - 1];
        let end = this.points[i];
        line(start.x - this.centroid.x, start.y - this.centroid.y,
             end.x - this.centroid.x, end.y - this.centroid.y); // Adjusted for centroid rotation
      }
    }
  }

  getColor(x, y) {
    // Define the center color
    let centerColor = color(245, 159, 190);
    // Calculate the center of the canvas
    let center = createVector(width / 2, height / 2);
    // Calculate the distance from the center
    let distanceFromCenter = dist(x, y, center.x, center.y);

    // If within 20 pixels of the center, use the center color
    if (distanceFromCenter <= 50) {
      return centerColor;
    }

    // Define colors for each corner
    let topLeftColor = color(0, 254, 153);
    let topRightColor = color(255, 255, 153);
    let bottomLeftColor = color(0, 89, 153);
    let bottomRightColor = color(255, 89, 153);

    // Calculate the mix ratio based on the position
    let mixX = map(x, 0, width, 0, 1);
    let mixY = map(y, 0, height, 0, 1);

    // Interpolate between top colors and bottom colors based on Y position
    let topColor = lerpColor(topLeftColor, topRightColor, mixX);
    let bottomColor = lerpColor(bottomLeftColor, bottomRightColor, mixX);

    // Finally, interpolate between the top and bottom colors based on X position
    return lerpColor(topColor, bottomColor, mixY);
  }
}
