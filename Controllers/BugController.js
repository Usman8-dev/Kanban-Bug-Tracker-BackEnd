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

const Update = async (req, res) => {
  try {
    const bug = await BugModel.findById(req.params.id);

    if (!bug) {
      return res.status(404).json({ success: false, message: "Bug not found" });
    }

    const userId = req.user.id;
    const isReporter = bug.assignedBy?.toString() === userId;
    const isAssignee = bug.assignedTo?.toString() === userId;

    if (!isReporter && !isAssignee) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this bug",
      });
    }

    if (isReporter) {
      // Reporter/lead can edit the entire form
      const { title, description, status, priority, projectId, assignedTo } =
        req.body;
      if (title !== undefined) bug.title = title;
      if (description !== undefined) bug.description = description;
      if (status !== undefined) bug.status = status;
      if (priority !== undefined) bug.priority = priority;
      if (projectId !== undefined) bug.projectId = projectId;
      if (assignedTo !== undefined) bug.assignedTo = assignedTo;
    } else if (isAssignee) {
      // Assignee can only change status
      const { status } = req.body;
      if (status !== undefined) bug.status = status;
    }

    const updatedBug = await bug.save();

    return res.status(200).json({
      success: true,
      message: "Bug Updated Successfully",
      bug: updatedBug,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const Search = async (req, res) => {
  try {
    const { query } = req.query;

    const filter = {
      $and: [
        { $or: [{ assignedBy: req.user.id }, { assignedTo: req.user.id }] },
        {
          $or: [{ title: { $regex: new RegExp(req.params.title, "i") } }],
        },
      ],
    };

    const bugs = await BugModel.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Search Results",
      bugs,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const Delete = async (req, res) => {
  try {
    const bug = await BugModel.findById(req.params.id);

    if (!bug) {
      return res.status(404).json({
        success: false,
        message: "Not found!",
      });
    }

    if (bug.assignedBy?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this bug",
      });
    }

    const deletedBug = await BugModel.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Deleted Successfully",
      bug: deletedBug,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { Create, ShowAllBug, Update, Search, Delete };
