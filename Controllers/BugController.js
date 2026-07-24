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
      seenBy: [],
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
    let allBug = await BugModel.find({
      $or: [{ assignedBy: req.user.id }, { assignedTo: req.user.id }],
    })
      .populate("projectId", "name")
      .populate("assignedBy", "name")
      .populate("assignedTo", "name")
      .sort({ createdAt: -1 });

    const bugsWithSeenStatus = allBug.map((bug) => ({
      ...bug.toObject(),
      isUnseen: !bug.seenBy.some((id) => id.toString() === req.user.id),
    }));

    return res.status(200).json({
      success: true,
      message: "All Bugs you Created",
      All_Bugs: bugsWithSeenStatus,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const ShowBugsByProject = async (req, res) => {
  try {
    let bugs = await BugModel.find({ projectId: req.params.projectId })
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Project Bugs",
      bugs,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// const Update = async (req, res) => {
//   try {
//     const bug = await BugModel.findById(req.params.id);

//     if (!bug) {
//       return res.status(404).json({ success: false, message: "Bug not found" });
//     }

//     const userId = req.user.id;
//     const isReporter = bug.assignedBy?.toString() === userId;
//     const isAssignee = bug.assignedTo?.toString() === userId;

//     if (!isReporter && !isAssignee) {
//       return res.status(403).json({
//         success: false,
//         message: "You are not authorized to update this bug",
//       });
//     }

//     if (isReporter) {
//       // Reporter/lead can edit the entire form
//       const { title, description, status, priority, projectId, assignedTo } =
//         req.body;
//       if (title !== undefined) bug.title = title;
//       if (description !== undefined) bug.description = description;
//       if (status !== undefined) bug.status = status;
//       if (priority !== undefined) bug.priority = priority;
//       if (projectId !== undefined) bug.projectId = projectId;
//       if (assignedTo !== undefined) bug.assignedTo = assignedTo;

//        // reporter made the change: keep it seen for them, mark unseen for the assignee
//       bug.seenBy = bug.seenBy.filter((id) => id.toString() !== bug.assignedTo?.toString());
//       if (!bug.seenBy.some((id) => id.toString() === userId)) {
//         bug.seenBy.push(userId);
//       }

//     } else if (isAssignee) {
//       // Assignee can only change status
//       const { status } = req.body;
//       if (status !== undefined) bug.status = status;

//        // assignee made the change: keep it seen for them, mark unseen for the reporter
//       bug.seenBy = bug.seenBy.filter((id) => id.toString() !== bug.assignedBy?.toString());
//       if (!bug.seenBy.some((id) => id.toString() === userId)) {
//         bug.seenBy.push(userId);
//       }

//     }

//     const updatedBug = await bug.save();

//     return res.status(200).json({
//       success: true,
//       message: "Bug Updated Successfully",
//       bug: updatedBug,
//     });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

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
      const { title, description, status, priority, projectId, assignedTo } = req.body;
      if (title !== undefined) bug.title = title;
      if (description !== undefined) bug.description = description;
      if (status !== undefined) bug.status = status;
      if (priority !== undefined) bug.priority = priority;
      if (projectId !== undefined) bug.projectId = projectId;
      if (assignedTo !== undefined) bug.assignedTo = assignedTo;

      bug.seenBy = bug.seenBy.filter((id) => id.toString() !== bug.assignedTo?.toString());
      if (!bug.seenBy.some((id) => id.toString() === userId)) {
        bug.seenBy.push(userId);
      }
    } else if (isAssignee) {
      const { status } = req.body;
      if (status !== undefined) bug.status = status;

      bug.seenBy = bug.seenBy.filter((id) => id.toString() !== bug.assignedBy?.toString());
      if (!bug.seenBy.some((id) => id.toString() === userId)) {
        bug.seenBy.push(userId);
      }
    }

    // Closed bugs are considered seen by everyone involved — nothing left to notify about
    if (bug.status === "Closed") {
      const involvedIds = [bug.assignedBy?.toString(), bug.assignedTo?.toString()].filter(Boolean);
      involvedIds.forEach((id) => {
        if (!bug.seenBy.some((seenId) => seenId.toString() === id)) {
          bug.seenBy.push(id);
        }
      });
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
const GetOneBug = async (req, res) => {
  try {
    const bug = await BugModel.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email")
      .populate("projectId", "name");

    if (!bug) {
      return res.status(404).json({ success: false, message: "Bug not found" });
    }

    const userId = req.user.id;
    const isReporter = bug.assignedBy?._id?.toString() === userId;
    const isAssignee = bug.assignedTo?._id?.toString() === userId;

    if (!isReporter && !isAssignee) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this bug",
      });
    }

    return res.status(200).json({
      success: true,
      bug,
      canEditAll: isReporter, // tells the frontend which form mode to render
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

const MarkSeen = async (req, res) => {
  try {
    const bug = await BugModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { seenBy: req.user.id } }, // adds only if not already present
      { new: true }
    );

    if (!bug) {
      return res.status(404).json({ success: false, message: "Bug not found" });
    }

    return res.status(200).json({ success: true, bug });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const UnreadCount = async (req, res) => {
  try {
    const count = await BugModel.countDocuments({
      $or: [{ assignedBy: req.user.id }, { assignedTo: req.user.id }],
      seenBy: { $ne: req.user.id },
    });

    return res.status(200).json({ success: true, count });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = {
  Create,
  ShowAllBug,
  Update,
  Search,
  Delete,
  ShowBugsByProject,
  GetOneBug,
   MarkSeen,
  UnreadCount,
};
