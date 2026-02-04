import { populate } from "dotenv";
import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";

export const createCourse = async (req, res) => {
  try {
    const { courseTitle, category } = req.body;

    console.log("Received Course Title:", courseTitle);
    console.log("Received Category:", category);

    if (!courseTitle || !category) {
      return res.status(400).json({
        success: false,
        message: "Course title and Category are required.",
      });
    }

    const course = await Course.create({
      courseTitle,
      category,
      creator: req.id,
    });

    console.log("Course created successfully:", course);

    return res.status(201).json({
      success: true,
      course,
      message: "Course created.",
    });
  } catch (error) {
    console.log("Error creating course:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create course",
    });
  }
};

export const searchCourse = async (req,res) => {
  try {
    const {query = "", categories=[], sortByPrice=""} = req.query;

    //create search query
    // const searchCriteria = {
    //   isPublished:true,
    //   $or:[
    //     {courseTitle: {$regex:query, $options:"i"}},
    //     {subTitle: {$regex:query, $options:"i"}},
    //     {category: {$regex:query, $options:"i"}},
    //   ]
    // }

    //if categories selected
    // if(categories.length > 0) {
    //   searchCriteria.category = {$in: categories};
    // }

    // Normalize categories into an array if it's a single string
    const normalizedCategories = Array.isArray(categories)
      ? categories
      : categories.length > 0
        ? [categories]
        : [];

    // Create search query
    const searchCriteria = {
      isPublished: true,
      $or: [
        { courseTitle: { $regex: query, $options: "i" } },
        { subTitle: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ]
    };

    // If categories selected
    if (normalizedCategories.length > 0) {
      searchCriteria.category = {
        $in: normalizedCategories.map(cat => new RegExp(`^${cat}$`, "i"))
      };
    }



    //define sorting order
    const sortOptions = {};
    if(sortByPrice === "low"){
      sortOptions.coursePrice = 1; //sort by price in ascending order
    }
    else if(sortByPrice === "high"){
      sortOptions.coursePrice = -1; //descending
    }

    let courses = await Course.find(searchCriteria).populate({path:"creator", select:"name photoUrl"}).sort(sortOptions);

    return res.status(200).json({
      success:true,
      courses:courses || []
    });



  } catch (error) {
    console.log(error)
  }
}






//to display published courses on the home page
export const getPublishedCourse = async (_, res) => {
  try {
    const course = await Course.find({ isPublished: true }).populate({
      path: "creator",
      select: "name photoUrl",
    });
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }
    return res.status(200).json({
      course,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get published courses",
    });
  }
};

export const getCreatorCourses = async (req, res) => {
  try {
    const userId = req.id;
    const courses = await Course.find({ creator: userId });
    if (!courses) {
      return res.status(404).json({
        courses: [],
        message: "Course not found",
      });
    }
    return res.status(200).json({
      courses,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create course",
    });
  }
};

export const editCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const {
      courseTitle,
      subTitle,
      description,
      category,
      courseLevel,
      coursePrice,
    } = req.body;
    const thumbnail = req.file;

    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found!",
      });
    }
    let courseThumbnail;
    if (thumbnail) {
      if (course.courseThumbnail) {
        const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
        await deleteMediaFromCloudinary(publicId); //delete old image of thumbnail
      }
      //upload a thumbnail on cloudinary
      courseThumbnail = await uploadMedia(thumbnail.path);
    }
    const updateData = {
      courseTitle,
      subTitle,
      description,
      category,
      courseLevel,
      coursePrice,
      courseThumbnail: courseThumbnail?.secure_url,
    };

    course = await Course.findByIdAndUpdate(courseId, updateData, {
      new: true,
    });

    return res.status(200).json({
      course,
      message: "Course updated successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create course",
    });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found!",
      });
    }
    return res.status(200).json({
      course,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create course by id",
    });
  }
};

//creating lecture logic
export const createLecture = async (req, res) => {
  try {
    const { lectureTitle } = req.body;
    const { courseId } = req.params;

    if (!lectureTitle || !courseId) {
      return res.status(400).json({
        message: "Lecture title is required",
      });
    }

    //create lecture
    const lecture = await Lecture.create({ lectureTitle });
    const course = await Course.findById(courseId);
    if (course) {
      course.lectures.push(lecture._id);
      await course.save();
    }
    return res.status(201).json({
      lecture,
      message: "Lecture created successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to create lecture.",
    });
  }
};

//getting lectures and displaying them on page based on that particular course
export const getCourseLecture = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate("lectures");
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }
    return res.status(200).json({
      lectures: course.lectures,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get lectures",
    });
  }
};

//for editing & updating the lecture
// export const editLecture = async (req, res) => {
//   try {
//     console.log(req.body);
//     const { lectureTitle, videoInfo, isPreviewFree } = req.body;
//     const { courseId, lectureId } = req.params;
//     const lecture = await Lecture.findById(lectureId);
//     if (!lecture) {
//       return res.status(404).json({
//         message: "Lecture not found!",
//       });
//     }

//     //update lecture
//     if (lectureTitle) lecture.lectureTitle = lectureTitle;
//     if (videoInfo?.videoUrl) lecture.videoUrl = videoInfo.videoUrl;
//     if (videoInfo?.publicId) lecture.publicId = videoInfo.publicId;
//     lecture.isPreviewFree = isPreviewFree;

//     await lecture.save();

//     //ensure the course still has the lecture id if it was not already added.
//     const course = await Course.findById(courseId);
//     if (course && !course.lectures.includes(lecture._id)) {
//       course.lectures.push(lecture._id);
//       await course.save();
//     }
//     return res.status(200).json({
//       lecture,
//       message: "Lecture updated successfully.",
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       message: "Failed to edit lectures",
//     });
//   }
// };
export const editLecture = async (req, res) => {
  try {
    const { lectureTitle, videoUrl, publicId, isPreviewFree } = req.body;
    const { lectureId } = req.params;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found!" });
    }

    if (lectureTitle) lecture.lectureTitle = lectureTitle;
    if (videoUrl) lecture.videoUrl = videoUrl;
    if (publicId) lecture.publicId = publicId;
    lecture.isPreviewFree = isPreviewFree;

    await lecture.save();

    res.status(200).json({
      success: true,
      lecture,
      message: "Lecture updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update lecture" });
  }
};


//removing lecture
export const removeLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findByIdAndDelete(lectureId);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found!",
      });
    }

    //delete the lecture from cloudinary as well
    if (lecture.publicId) {
      await deleteMediaFromCloudinary(lecture.publicId);
    }

    //remove the lecture reference from the associated course
    await Course.updateOne(
      { lectures: lectureId }, //find the course that contains the lecture
      { $pull: { lectures: lectureId } } //remove the lectures id from the lectures array
    );

    return res.status(200).json({
      message: "Lecture removed successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to remove lecture",
    });
  }
};

//get lecture by id
export const getLectureById = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found!",
      });
    }
    return res.status(200).json({
      lecture,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get lecture by id",
    });
  }
};

//publish and unpublish course logic

export const togglePublishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { publish } = req.query; //true,false
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found!",
      });
    }

    //publish status based on the query parameter
    course.isPublished = publish === "true";
    await course.save();

    const statusMessage = course.isPublished ? "Published" : "Unpublished";
    return res.status(200).json({
      message: `Course is ${statusMessage}`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to update status",
    });
  }
};
