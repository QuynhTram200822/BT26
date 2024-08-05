const fs = require("fs");

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

function readUser(filePath) {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`File not found: ${filePath}`);
    } else if (error.name === "SyntaxError") {
      throw new Error("Error parsing JSON: " + error.message);
    } else {
      throw new Error("Error reading file: " + error.message);
    }
  }
}

function validateDateOfBirth(users) {
  const regex = /^\d{4}\/\d{2}\/\d{2}$/;
  users.forEach((user) => {
    if (!regex.test(user.dateOfBirth)) {
      throw new ValidationError(
        `Invalid date format for user with ID: ${user.id}`
      );
    }
    const [year, month, day] = user.dateOfBirth.split("/").map(Number);
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      throw new ValidationError(`Invalid date for user with ID: ${user.id}`);
    }
  });
}

// Hàm chính để thực hiện các bước trên
async function main() {
  try {
    const filePath = "db.json";
    let data;
    try {
      data = readUser(filePath);
    } catch (fileError) {
      if (fileError.message.startsWith("File not found")) {
        console.error("File error:", fileError.message);
        return;
      } else if (fileError.message.startsWith("Error parsing JSON")) {
        console.error("JSON parsing error:", fileError.message);
        return;
      } else {
        console.error("Error reading file:", fileError.message);
        return;
      }
    }

    const users = data.users;

    try {
      validateDateOfBirth(users);
      console.log("All dates of birth are valid.");
      console.log(users);
    } catch (validationError) {
      console.error("Date validation error:", validationError.message);
    }
  } catch (error) {
    console.error("Unexpected error:", error.message);
  }
}

main();
