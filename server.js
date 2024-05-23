import express from 'express';
import mongoose from 'mongoose';
import path from 'path'; // Implemented during troubleshooting
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config(); // Added .env to this project as well, after learning about it.

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Absolute path calculation to avoid problems with the file serving
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'dist')));

// MongoDB connection using.env
const mongoURI = process.env.CONNECTION_STRING;
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err, "VPN?"));

// MongoDB collection schemas as required
const employeeSchema = new mongoose.Schema({
  employee_id: { type: String, unique: true },
  full_name: String,
  email: String,
  hashed_password: String // I'll implement hashing in the end
});
const projectSchema = new mongoose.Schema({
  project_code: { type: String, unique: true },
  project_name: String,
  project_description: String
});
const projectAssignmentSchema = new mongoose.Schema({
  employee_id: String,
  project_code: String,
  start_date: Date
});

// Creating the corresponding models
const Employee = mongoose.model('Employee', employeeSchema);
const Project = mongoose.model('Project', projectSchema);
const ProjectAssignment = mongoose.model('ProjectAssignment', projectAssignmentSchema);

// API routes
app.post('/api/employees', async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).send(employee);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).send(project);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post('/api/project_assignments', async (req, res) => {
  try {
    const assignment = new ProjectAssignment(req.body);
    await assignment.save();
    res.status(201).send(assignment);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Only one GET route is needed for project_assignments
app.get('/api/project_assignments', async (req, res) => {
  try {
    const assignments = await ProjectAssignment.aggregate([ // aggregate is used to gather and combine the data from different collections
      { // This joins the projectAssignment with the employees collection, putting records with the same employee_id together
        $lookup: {
          from: 'employees',
          localField: 'employee_id',
          foreignField: 'employee_id',
          as: 'employee'
        }
      },
      { // Same as above for projects using project_code
        $lookup: {
          from: 'projects',
          localField: 'project_code',
          foreignField: 'project_code',
          as: 'project'
        }
      },
      {
        $unwind: '$employee' // Makes the array fields created above into separate documents
      },
      {
        $unwind: '$project'
      },
      {
        $project: {
          _id: 1, // 1 is just a boolean value to determine to include this field
          employee_id: 1,
          full_name: '$employee.full_name', // Here we can't just use one, because we need to define which document to take the value from as well.
          project_name: '$project.project_name',
          start_date: 1
        }
      }
    ]);

    res.status(200).send(assignments);
  } catch (error) {
    res.status(500).send(error);
  }
});


app.listen(PORT, () => {
  console.log(`Click me! - http://localhost:${PORT}`);
});
