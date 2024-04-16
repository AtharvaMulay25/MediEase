import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Input,
  Typography,
} from "@material-tailwind/react";

import Layout from "../layouts/PageLayout";
import { useAuthContext } from "../hooks/useAuthContext";
import { apiRoutes } from "../utils/apiRoutes";
import { SyncLoadingScreen } from "../components/UI/LoadingScreen";

const getStaffData = async (userEmail) => {
  try {
    const response = await axios.get(`${apiRoutes.profile}/staff/${userEmail}`, {
      withCredentials: true,
    });

    toast.success("Staff profile fetched successfully");
    return response.data.data;
  } catch (error) {
    console.error(`ERROR: ${error?.response?.data?.message}`);
    toast.error(error?.response?.data?.message || "Failed to fetch Staff Profile");
  }
};

export default function StaffProfile({ edit = false }) {
  const { userEmail } = useAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [staffDetail, setStaffDetail] = useState({
    name: "Dr. John Doe",
    role: "Doctor",
    mobileNumber: "9876543210",
    email: "john@gmail.com",
    gender: "Male",
    department: "General Medicine",
    specialisation: "Surgeon",
    checkupCount: 100,
    appointments: 10,
  });

  const [scheduleData, setScheduleData] = useState([
    { day: "Sunday", shift: "Morning" },
    { day: "Monday", shift: "Morning" },
    { day: "Tuesday", shift: "Morning" },
    { day: "Wednesday", shift: "Morning" },
    { day: "Thursday", shift: "Morning" },
    { day: "Friday", shift: "Morning" },
    { day: "Saturday", shift: "Morning" },
  ]);

  useEffect(() => {
    const fetchStaffData = async () => {
      if (userEmail) {
        setLoading(true);
        const data = await getStaffData(userEmail);

        const staffData = {
          name: data.name,
          role: data.role,
          email: data.email,
          mobileNumber: data.mobileNumber || "",
          gender: data.gender,
          department: data.department,
          specialisation: data.specialisation || "Surgeon",
          checkupCount: data.checkupCount,
        };

        setStaffDetail(staffData);
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [userEmail]);

  const handleSave = async () => {
    const sendData = {
      name: staffDetail.name,
      email: staffDetail.email,
      role: staffDetail.role,
      gender: staffDetail.gender,
    }
    if (staffDetail.mobileNumber) sendData.mobileNumber = staffDetail.mobileNumber;
    if (staffDetail.department) sendData.department = staffDetail.department;
    try {
      setLoading(true);
      const response = await axios.put(
        `${apiRoutes.profile}/staff/${userEmail}`,
        sendData,
        {
          withCredentials: true,
        }
      );
      toast.success(response.data.message);
      navigate("/profile/staff");
    } catch (error) {
      console.error(`ERROR: ${error?.response?.data?.message}`);
      toast.error(
        error?.response?.data?.message || "Failed to update Staff Profile"
      );
    }
    setLoading(false);
  }
  return (
    <>
      {loading && <SyncLoadingScreen />}
      {!loading && (
        <Layout>
          <Card className="flex w-full">
            <CardHeader floated={false} shadow={false} className="rounded-none">
              <Typography variant="h3" color="blue-gray" className="text-center ">
                {edit && "Update"} Staff Profile
              </Typography>
            </CardHeader>
            <CardBody className="flex flex-col justify-center md:flex-row gap-y-4">
              <div className="flex flex-col md:w-2/5 w-full min-w-fit justify-center gap-8 p-4 border border-blue-gray-100 ">
                <div className="flex justify-center">
                  <img
                    src="/src/assets/img/doctor.png"
                    alt="staff"
                    className="rounded-full w-48 h-48 "
                  />
                </div>
                <div className="content-center text-center grid sm:grid-cols-2 gap-y-3">
                  <Typography variant="h6" className=" sm:text-center">
                    Name:{" "}
                  </Typography>
                  {edit ? (
                    <input
                      placeholder="Full Name"
                      className="px-2 py-1 border border-blue-gray-200 rounded-md"
                      value={staffDetail.name}
                      onChange={(e) =>
                        setStaffDetail({ ...staffDetail, name: e.target.value })
                      }
                    />
                  ) : (
                    <Typography color="blue-gray">
                      {staffDetail.name}
                    </Typography>
                  )}
                  <Typography variant="h6" >
                    Role:{" "}
                  </Typography>
                  {edit ? (
                    <Input disabled value={staffDetail.email} />
                  ) : (
                    <Typography color="blue-gray">
                      {staffDetail.role}
                    </Typography>
                  )}
                  <Typography variant="h6" >
                    Mobile Number:{" "}
                  </Typography>
                  {edit ? (
                    <input
                      placeholder="Mobile"
                      className="px-2 py-1 border border-blue-gray-200 rounded-md"
                      value={staffDetail.mobileNumber}
                      onChange={(e) =>
                        setStaffDetail({ ...staffDetail, mobileNumber: e.target.value })
                      }
                    />
                  ) : (
                    <Typography color="blue-gray">
                      {staffDetail.mobileNumber}
                    </Typography>
                  )}
                  <Typography variant="h6" >
                    Email:{" "}
                  </Typography>
                  {edit ? (
                    <Input disabled value={staffDetail.email} />
                  ) : (
                    <Typography color="blue-gray">
                      {staffDetail.email}
                    </Typography>
                  )}
                  <Typography variant="h6" >
                    Gender:{" "}
                  </Typography>
                  {edit ? (
                    <select
                      name="gender"
                      className="px-2 py-1 border border-blue-gray-200 rounded-md"
                      value={staffDetail.gender}
                      onChange={(e) =>
                        setStaffDetail({
                          ...staffDetail,
                          gender: e.target.value,
                        })
                      }
                    >
                      <option key="Male" value="MALE">MALE</option>
                      <option key="Female" value="FEMALE">FEMALE</option>
                    </select>
                  ) : (
                    <Typography color="blue-gray">
                      {staffDetail.gender}
                    </Typography>
                  )}
                  {edit && (
                    <>
                      <Typography variant="h6" >
                        Department:{" "}
                      </Typography>
                      <input
                        placeholder="Full Name"
                        className="px-2 py-1 border border-blue-gray-200 rounded-md"
                        value={staffDetail.department}
                        onChange={(e) =>
                          setStaffDetail({ ...staffDetail, department: e.target.value })
                        }
                      />
                      <Typography variant="h6" >
                        Specialisation:{" "}
                      </Typography>
                      <input
                        placeholder="Full Name"
                        className="px-2 py-1 border border-blue-gray-200 rounded-md"
                        value={staffDetail.specialisation}
                        onChange={(e) =>
                          setStaffDetail({ ...staffDetail, specialisation: e.target.value })
                        }
                      />
                    </>
                  )}
                </div>
              </div>
              { !edit && (
              <>
                <div className="px-4 md:w-1/3 flex flex-col justify-around gap-4">
                  <div className="flex flex-col border border-blue-gray-100 p-4 w-full rounded-xl text-center">
                    <Typography variant="h6" color="gray" className="mb-2">
                      Department
                    </Typography>
                    <Typography variant="h4" color="blue-gray">
                      {staffDetail.department}
                    </Typography>
                  </div>
                  <div className="flex flex-col border border-blue-gray-100 p-4 w-full rounded-xl text-center">
                    <Typography variant="h6" color="gray" className="mb-2">
                      Specialisation
                    </Typography>
                    <Typography variant="h4" color="blue-gray">
                      {staffDetail.specialisation}
                    </Typography>
                  </div>
                  <div className="flex flex-col border border-blue-gray-100 p-4 w-full rounded-xl text-center">
                    <Typography variant="h6" color="gray" className="mb-2">
                      No. of Checkups
                    </Typography>
                    <Typography variant="h4" color="blue-gray">
                      {staffDetail.checkupCount}
                    </Typography>
                  </div>
                </div>
                <div className="text-center md:w-1/3">
                  <Typography
                    variant="h6"
                    color="blue-gray"
                    className="mb-2 bg-blue-gray-100 rounded p-2 border border-black"
                  >
                    Working Hours
                  </Typography>

                  <table className="w-full min-w-max table-auto text-left">
                    <thead>
                      <tr>
                        <th
                          key="day"
                          className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                        >
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal leading-none opacity-70"
                          >
                            Day
                          </Typography>
                        </th>
                        <th
                          key="shift"
                          className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                        >
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal leading-none opacity-70"
                          >
                            Shift
                          </Typography>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {scheduleData.map((rowData, index) => {
                        return (
                          <tr key={rowData.day}>
                            <td className="p-4 border-b border-blue-gray-50">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal"
                              >
                                {rowData.day}
                              </Typography>
                            </td>
                            <td className="p-4 border-b border-blue-gray-50">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal"
                              >
                                {rowData.shift}
                              </Typography>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
              )}
            </CardBody>
            <CardFooter className="flex justify-end">
              {edit ? (
                <div className="flex w-full justify-between">
                  <Button
                    className="flex items-center gap-3"
                    size="md"
                    onClick={() => {navigate("/profile/staff");}}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex items-center gap-3"
                    size="md"
                    onClick={handleSave}
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <Button
                  className="flex items-center gap-3"
                  size="md"
                  onClick={() => {navigate("/profile/staff/edit")}}
                >
                  Edit Profile
                </Button>
              )}
            </CardFooter>
          </Card>
        </Layout>
      )}
    </>
  );
}
