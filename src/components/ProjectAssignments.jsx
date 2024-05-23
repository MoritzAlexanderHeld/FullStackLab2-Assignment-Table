import React, { useEffect, useState } from 'react';

const ProjectAssignments = () => {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/project_assignments'); // Fetching the project assignments from the API
        const data = await response.json(); // Parsing the response as JSON
        setAssignments(data); // Updating the state with the fetched data
      } catch (error) { // Basic error handling
        console.error('Error fetching project assignments:', error);
      }
    };

    // Calling the fetchData function
    fetchData();

    // This is the refreshing timer using AJAX (60kms = 60sec)
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Return the project assignments component
  return (
    <div>
      <h1>Project Assignments</h1>
      <table>
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Employee Name</th>
            <th>Project Name</th>
            <th>Start Date</th>
          </tr>
        </thead>
        <tbody>
          {/* We use .map to go over all parts of each assignment*/}
          {assignments.map((assignment) => (
            <tr key={assignment._id}>
              <td>{assignment.employee_id}</td>
              <td>{assignment.full_name}</td>
              <td>{assignment.project_name}</td>
              <td>{new Date(assignment.start_date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Exporting the ProjectAssignments component as the default export
export default ProjectAssignments;
