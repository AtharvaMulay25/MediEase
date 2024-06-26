//prisma client
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const sendMail = require("../utils/sendMail");
const { ACCOUNT_DELETED_MAIL_TEMPLATE } = require("../../constants");
const ExpressError = require("../utils/ExpressError");

// @desc    Get Patient Profile
// route    GET /api/profile/patient/:email
// @access  Private (Admin)
const getPatientProfile = async (req, res, next) => {
	try{
		const patientProfile = await prisma.patient.findUnique({
			where: {
			email: req.params?.email,
			},
		});
		return res.status(200).json({
			ok: true,
			data: patientProfile,
			message: "Patient Profile retrieved successfully",
		});
	} catch (error) {
		console.log(`Error in fetching patient: ${error.message}`);

		return res.status(500).json({
			ok: false,
			data: [],
			message: "Fetching data failed, Please try again later",
		});
	}
};

// @desc    Update Patient Profile
// route    PUT /api/profile/patient/:email
// @access  Private (Admin)
const updatePatientProfile = async (req, res, next) => {
	try{
		const updatedProfile = await prisma.patient.update({
			where: {
				email: req.params?.email,
			},
			data: req.body,
		});

		const updatedUserProfile = await prisma.user.update({
			where: {
				email: req.params?.email,
			},
			data: {
				name: req.body.name,
			},
		});

		return res.status(200).json({
			ok: true,
			data: updatedProfile,
			message: "Patient Profile updated successfully",
		});
	} catch (error) {
		console.log(`Error in updating patient: ${error.message}`);

		let errMsg = "Updating patient profile failed, Please try again later";
    let errCode = 500;

    //record does not exist
    if (error.code === "P2025") {
      errMsg = "Profile does not exist";
      errCode = 404;
    }

    return res.status(errCode).json({
      ok: false,
      data: [],
      message: errMsg,
    });
	}
}

// @desc    Delete Patient Profile
// route    DELETE /api/profile/patient/:email
// @access  Private (Admin)
const deletePatientProfile = async (req, res, next) => {
	try{
		const deletedPatient = await prisma.patient.update({
			where: {
				email: req.params?.email,
			},
			data: {
				status: "INACTIVE",
			},
		});

		const deletedUser = await prisma.user.update({
			where: {
				email: req.params?.email,
			},
			data: {
				status: "INACTIVE",
			},
		});

		//send mail to the patient
    const mailTemplate = ACCOUNT_DELETED_MAIL_TEMPLATE();
    const mailOptions = {
      from: "dep2024.p06@gmail.com",
      to: deletedPatient.email,
      subject: "Mediease - Account Deleted",
      html: mailTemplate,
      text: "",
    };

		const info = await sendMail(mailOptions);
		if (!info) {
      throw new ExpressError("Error in sending mail to the patient", 500);
    }

		return res.status(200).json({
			ok: true,
			data: deletedPatient,
			message: "Profile deleted successfully",
		});
	} catch (error) {
		console.log(error);
		console.log(`Profile deleting error: ${error.message}`);

		let errMsg = "Deleting account failed, Please try again later";
    let errCode = 500;

    //record does not exist
    if (error.code === "P2025") {
      errMsg = "Profile does not exist";
      errCode = 404;
    }

    return res.status(errCode).json({
      ok: false,
      data: [],
      message: errMsg,
    });
	}
};


// @desc    Get Staff Profile
// route    GET /api/profile/staff/:email
// @access  Private (Admin)
const getStaffProfile = async (req, res, next) => {
	try{
		const staffProfile = await prisma.staff.findUnique({
			where: {
				email: req.params?.email,
			},
		});

		const checkupCount = (await prisma.checkup.findMany({
			where: {
				staffId: staffProfile?.id,
			},
		})).length;

		staffProfile.checkupCount = checkupCount;
		
		return res.status(200).json({
			ok: true,
			data: staffProfile,
			message: "Staff Profile retrieved successfully",
		});
	} catch (error) {
		console.log(`Error in fetching staff: ${error.message}`);

		return res.status(500).json({
			ok: false,
			data: [],
			message: "Fetching data failed, Please try again later",
		});
	}
};

// @desc    Get Schedule
// route    GET /api/profile/staff/schedule/:email
// @access  Private (Admin)
const getStaffSchedule = async (req, res, next) => {
	try {
	  const staff = await prisma.staff.findUnique({
		where: {
		  email: req.params?.email,
		},
	  });
  
	  const schedule = await prisma.schedule.findMany({
		where: {
		  staffId: staff.id,
		},
	  });
  
	  const sendScheduleData = schedule.map((schedule) => ({
		day: schedule.day,
		shift: schedule.shift,
	  }));
  
	  return res.status(200).json({
		ok: true,
		data: sendScheduleData,
		message: "Schedule retrieved successfully",
	  });
	} catch (error) {
	  console.log(`Error in fetching schedule: ${error.message}`);
  
	  return res.status(500).json({
		ok: false,
		data: [],
		message: "Fetching data failed, Please try again later",
	  });      
	}
  }

// @desc    Update Staff Profile
// route    PUT /api/profile/staff/:email
// @access  Private (Admin)
const updateStaffProfile = async (req, res, next) => {
	try{
		const updatedProfile = await prisma.staff.update({
			where: {
				email: req.params?.email,
			},
			data: req.body,
		});

		const updatedUserProfile = await prisma.user.update({
			where: {
				email: req.params?.email,
			},
			data: {
				name: req.body.name,
			},
		});
		
		return res.status(200).json({
			ok: true,
			data: updatedProfile,
			message: "Staff Profile updated successfully",
		});
	} catch (error) {
		console.log(`Error in updating staff: ${error.message}`);

		let errMsg = "Updating staff profile failed, Please try again later";
		let errCode = 500;

		//record does not exist
		if (error.code === "P2025") {
			errMsg = "Profile does not exist";
			errCode = 404;
		}

		return res.status(errCode).json({
			ok: false,
			data: [],
			message: errMsg,
		});
	}
}

// @desc    Delete Staff Profile
// route    DELETE /api/profile/staff/:email
// @access  Private (Admin)
const deleteStaffProfile = async (req, res, next) => {
	try{
		const deletedStaff = await prisma.staff.update({
			where: {
				email: req.params?.email,
			},
			data: {
				status: "INACTIVE",
			},
		});

		const deletedUser = await prisma.user.update({
			where: {
				email: req.params?.email,
			},
			data: {
				status: "INACTIVE",
			},
		});

		//send mail to the Staff
    const mailTemplate = ACCOUNT_DELETED_MAIL_TEMPLATE();
    const mailOptions = {
      from: "dep2024.p06@gmail.com",
      to: deletedStaff.email,
      subject: "Mediease - Account Deleted",
      html: mailTemplate,
      text: "",
    };

		const info = await sendMail(mailOptions);
		if (!info) {
      throw new ExpressError("Error in sending mail to the Staff", 500);
    }

		return res.status(200).json({
			ok: true,
			data: deletedStaff,
			message: "Profile deleted successfully",
		});
	} catch (error) {
		console.log(error);
		console.log(`Profile deleting error: ${error.message}`);

		let errMsg = "Deleting account failed, Please try again later";
    let errCode = 500;

    //record does not exist
    if (error.code === "P2025") {
      errMsg = "Profile does not exist";
      errCode = 404;
    }

    return res.status(errCode).json({
      ok: false,
      data: [],
      message: errMsg,
    });
	}
}

// @desc    Get Admin Profile
// route    GET /api/profile/admin/:email
// @access  Private (Admin)
const getAdminProfile = async (req, res, next) => {
	try{
		const adminProfile = await prisma.user.findUnique({
			where: {
				email: req.params?.email,
			},
		});

		return res.status(200).json({
			ok: true,
			data: adminProfile,
			message: "Admin Profile retrieved successfully",
		});
	} catch (error) {
		console.log(`Error in fetching admin: ${error.message}`);

		return res.status(500).json({
			ok: false,
			data: [],
			message: "Fetching data failed, Please try again later",
		});
	}
}

// @desc    Update Admin Profile
// route    PUT /api/profile/admin/:email
// @access  Private (Admin)
const updateAdminProfile = async (req, res, next) => {
	try{
		const updatedProfile = await prisma.user.update({
			where: {
				email: req.params?.email,
			},
			data: req.body,
		});

		return res.status(200).json({
			ok: true,
			data: updatedProfile,
			message: "Admin Profile updated successfully",
		});
	} catch (error) {
		console.log(`Error in updating admin: ${error.message}`);

		let errMsg = "Updating admin profile failed, Please try again later";
		let errCode = 500;

		//record does not exist
		if (error.code === "P2025") {
			errMsg = "Profile does not exist";
			errCode = 404;
		}

		return res.status(errCode).json({
			ok: false,
			data: [],
			message: errMsg,
		});
	}
}

// @desc    Delete Staff Profile
// route    DELETE /api/profile/staff/:email
// @access  Private (Admin)
const deleteAdminProfile = async (req, res, next) => {
	try{
		const deletedUser = await prisma.user.update({
			where: {
				email: req.params?.email,
			},
			data: {
				status: "INACTIVE",
			},
		});

		//send mail to the Staff
    const mailTemplate = ACCOUNT_DELETED_MAIL_TEMPLATE();
    const mailOptions = {
      from: "dep2024.p06@gmail.com",
      to: deletedUser.email,
      subject: "Mediease - Account Deleted",
      html: mailTemplate,
      text: "",
    };

		const info = await sendMail(mailOptions);
		if (!info) {
      throw new ExpressError("Error in sending mail to the Staff", 500);
    }

		return res.status(200).json({
			ok: true,
			data: deletedUser,
			message: "Profile deleted successfully",
		});
	} catch (error) {
		console.log(error);
		console.log(`Profile deleting error: ${error.message}`);

		let errMsg = "Deleting account failed, Please try again later";
    let errCode = 500;

    //record does not exist
    if (error.code === "P2025") {
      errMsg = "Profile does not exist";
      errCode = 404;
    }

    return res.status(errCode).json({
      ok: false,
      data: [],
      message: errMsg,
    });
	}
}


module.exports = {
	getPatientProfile,
	updatePatientProfile,
	deletePatientProfile,
	getStaffProfile,
	getStaffSchedule,
	updateStaffProfile,
	deleteStaffProfile,
	getAdminProfile,
	updateAdminProfile,
	deleteAdminProfile,
};

