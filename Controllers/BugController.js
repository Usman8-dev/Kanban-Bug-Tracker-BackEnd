const BugModel = require("../Models/BugModel");

const Create = async (req, res) => {
  try {
    let { title, description, status, priority, projectId, assignedTo } = req.body;

    const bug = await BugModel.create({
      title,
      description,
      status,
      priority,
      projectId,
      assignedTo,
      assignedBy: req.user.id, // whoever is logged in and filing the bug
    });

    return res.status(201).json({
      success: true,
      message: "Bug Created Successfully",
      bug,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { Create };