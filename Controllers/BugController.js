const BugModel = require("../Models/BugModel");

const Create = async (req, res) => {
  try {
    let { title, description, status, priority, projectId, assignedTo } =
      req.body;

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

const ShowAllBug = async (req, res) => {
  try {
    // let allBug = await BugModel.find({ assignedBy: req.user.id }).sort({ date: -1 });
    let allBug = await BugModel.find({
      $or: [{ assignedBy: req.user.id }, { assignedTo: req.user.id }],
    }).sort({ createdAt: -1 });

    return res.status(201).json({
      success: true,
      message: "All Bugs you Created",
      All_Bugs: allBug,
    });
  } catch (err) {
    return res.status(401).json({
      err: err.message,
    });
  }
};
module.exports = { Create, ShowAllBug };
