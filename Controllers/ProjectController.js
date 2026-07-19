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
      All_Expenses: allProject,
    });

  } catch (err) {
    return res.status(401).json({
      err: err.message,
    })
  }
}
module.exports = { Create , ShowAllProject};
