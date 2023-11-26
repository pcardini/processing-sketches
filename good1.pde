ArrayList<Line> lines; // List to store multiple lines
Line currentLine;      // The line currently being drawn

void setup() {
  size(300, 300); // Set canvas size
  lines = new ArrayList<Line>();
  background(245, 159, 190); // Set background color
}

void draw() {
  for (Line line : lines) {
    line.display(); // Display each line
  }

  if (currentLine != null) {
    currentLine.addPoint(new PVector(mouseX, mouseY)); // Add points to current line
    currentLine.displayTemporary(); // Display the current line being drawn
  }
}

void mousePressed() {
  currentLine = new Line(); // Start a new line
}

void mouseReleased() {
  currentLine.calculateCentroid(); // Calculate centroid for the line
  currentLine.startRotating(); // Start rotating the line
  lines.add(currentLine); // Add the completed line to the list
  currentLine = null; // Reset current line
}

class Line {
  ArrayList<PVector> points; // Points of the line
  ArrayList<Float> strokeWeights; // Stroke weights for each segment
  PVector centroid; // Centroid of the line
  boolean shouldRotate = false; // Flag to indicate if the line should rotate
  float angle = 0; // Rotation angle
  float rotationDirection; // Variable for rotation direction
  color lineColor; // Color of the line

  Line() {
    points = new ArrayList<PVector>();
    strokeWeights = new ArrayList<Float>();
    centroid = new PVector();
    lineColor = getColor(mouseX, mouseY); // Set line color based on initial position
    rotationDirection = random(1) < 0.5 ? -1 : 1; // Randomly assign rotation direction
  }

  void addPoint(PVector point) {
    points.add(point);

    if (points.size() >= 2) {
        PVector lastPoint = points.get(points.size() - 2);
        float distance = PVector.dist(lastPoint, point);

        // Ensure thicker stroke for slower movement; use abs() to avoid negative values
        float weight = abs(map(distance, 0, 30, 5, 1));
        strokeWeights.add(weight);
    }
}

  void calculateCentroid() {
    float sumX = 0;
    float sumY = 0;
    for (PVector v : points) {
      sumX += v.x;
      sumY += v.y;
    }
    centroid = new PVector(sumX / points.size(), sumY / points.size(), 0);
  }

  void startRotating() {
    shouldRotate = true;
  }

   void display() {
    pushMatrix();
    translate(centroid.x, centroid.y);
    if (shouldRotate) {
      rotate(angle * rotationDirection);
      angle += 0.005;
    }
    drawLine();
    popMatrix();
  }

  void displayTemporary() {
    drawLine();
  }

  void drawLine() {
    stroke(lineColor);
    noFill();

    for (int i = 0; i < points.size(); i++) {
        float weight = (i < strokeWeights.size()) ? strokeWeights.get(i) : 1;
        strokeWeight(weight);

        if (i > 0) {
            PVector start = points.get(i - 1);
            PVector end = points.get(i);
            line(start.x - centroid.x, start.y - centroid.y, 
                 end.x - centroid.x, end.y - centroid.y); // Adjusted for centroid rotation
        }
    }
}

 color getColor(int x, int y) {
  // Define the center color
  color centerColor = color(245, 159, 190);
  // Calculate the center of the canvas
  PVector center = new PVector(width / 2, height / 2);
  // Calculate the distance from the center
  float distanceFromCenter = dist(x, y, center.x, center.y);

  // If within 20 pixels of the center, use the center color
  if (distanceFromCenter <= 50) {
    return centerColor;
  }

  // Define colors for each corner
  color topLeftColor = color(0, 254, 153);
  color topRightColor = color(255, 255, 153);
  color bottomLeftColor = color(0, 89, 153);
  color bottomRightColor = color(255, 89, 153);

  // Calculate the mix ratio based on the position
  float mixX = map(x, 0, width, 0, 1);
  float mixY = map(y, 0, height, 0, 1);

  // Interpolate between top colors and bottom colors based on Y position
  color topColor = lerpColor(topLeftColor, topRightColor, mixX);
  color bottomColor = lerpColor(bottomLeftColor, bottomRightColor, mixX);

  // Finally, interpolate between the top and bottom colors based on X position
  return lerpColor(topColor, bottomColor, mixY);
}

}
