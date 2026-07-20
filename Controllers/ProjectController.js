const ProjectModel = require("../Models/ProjectModel");

const Create = async (req, res) => {
  try {
    let { name, description } = req.body;

    // create the project
    const proj = await ProjectModel.create({
      name,
      description,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Project Created Successfully",
      project: proj,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const ShowAllProject = async(req, res) =>{
   try {
    let allProject = await ProjectModel.find({ createdBy: req.user.id }).sort({ date: -1 });
    return res.status(201).json({
      success: true,
      message: "All Projects",
      All_Project: allProject,
    });

  } catch (err) {
    return res.status(401).json({
      err: err.message,
    })
  }
}

const Update = async (req, res) =>{
  try {
     const { id } = req.params; // Get project ID from URL
    let { name, description } = req.body;

    // Find project, verify ownership, and update it
    const updatedProj = await ProjectModel.findOneAndUpdate(
      { _id: id, createdBy: req.user.id }, // Security: Only the creator can update it
      { name, description },
      { new: true} 
    );

    if (!updatedProj) {
      return res.status(404).json({
        success: false,
        message: "Project not found or you are not authorized to update it",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project Updated Successfully",
      project: updatedProj,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

const Search = async (req, res) => {
  try {
    let findTitle = await ProjectModel.find({
      createdBy: req.user.id,
      name: {
        $regex: new RegExp(req.params.name, "i")
      }
    });

     if (findTitle.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No matching projects found!',
      });
    }

    if (!findTitle) {
      return res.status(401).json({
        success: false,
        message: 'Project not found!!',
      })
    }

    return res.status(201).json({
      success: true,
      message: "Project Founded Successfully",
      Expense: findTitle,
    });
  } catch (err) {
    return res.status(201).json({
      success: false,
      message: err.message,
    });
  }
}

const Delete = async (req, res) => {
  try {
    let deleteProject = await ProjectModel.findByIdAndDelete(req.params.id);

    if (!deleteProject) {
      return res.status(201).json({
        success: true,
        message: "Not found!",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Deleted Successfully",
      Expense: deleteProject,
    });
  } catch (err) {
    res.send(err.message);
  }
}


module.exports = { Create , ShowAllProject, Update, Search, Delete};
