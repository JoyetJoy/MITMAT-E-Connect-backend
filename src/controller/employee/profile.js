const signupModel = require('../../../Models/signupmodel');
const bcryptjs = require('bcryptjs');
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

exports.profileGet = async (req, res) => {
    try {
        const id = req.query.id;
        const employee = await signupModel.findOne({ _id: id });
        
        if (employee) {
            res.status(200).json({ employee });
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'There was an error fetching the profile' });
    }
};

exports.profilePut = async (req, res) => {
    try {
        const id = req.query.id; // Correct extraction of id from query parameters
        const { name, email, phonenumber, position } = req.body;
        
        const updatedEmployee = await signupModel.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    username: name,
                    email: email,
                    phonenumber: phonenumber,
                    position: position
                }
            },
            { new: true } // Return the updated document
        );
        
        if (updatedEmployee) {
            res.status(200).json({
                updatedEmployee,
                message: 'Profile Updated Successfully!'
            });
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'There was an error updating the profile' });
    }
};
exports.updatePasswordPost = async (req, res) => {
    try {
      const id = req.query.id;
      const { oldPassword, newPassword } = req.body;
  
      // Validate the new password with regex
      const validatePassword = passwordRegex.test(newPassword);
  
      // Fetch the employee by id
      const employee = await signupModel.findOne({ _id: id });
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found!' });
      }
  
      // Compare old password with the employee's current password
      const passmatch = await bcryptjs.compare(oldPassword, employee.password);
      if (!passmatch) {
        return res.status(400).json({ message: 'Old password is incorrect!' });
      }
  
      if (!validatePassword) {
        return res.status(400).json({ message: 'New password is not valid!' });
      }
  
      // Hash the new password and update it
      const hashedPassword = await bcryptjs.hash(newPassword, 10);
      const updatedEmployee = await signupModel.findOneAndUpdate(
        { _id: id },
        { $set: { password: hashedPassword } },
        { new: true }
      );
  
      if (updatedEmployee) {
        return res.status(200).json({ updatedEmployee, message: 'Password updated successfully!' });
      } else {
        return res.status(404).json({ message: 'Employee not found!' });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };