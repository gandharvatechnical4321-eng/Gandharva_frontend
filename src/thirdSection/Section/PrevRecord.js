import react, { useEffect } from "react";
import { useState } from "react";
import { IoFilterSharp } from "react-icons/io5";
import { MdFilterListOff } from "react-icons/md";
import Next24hrCard from "../../thirdSection/card/Next24hrCard";
import axios from "axios";
import Cookies from "js-cookie";
import { setPrevRecord } from "../../features/taskSlice";
import { useDispatch,useSelector } from "react-redux"; 
const PrevRecord = () =>{
    const dispatch = useDispatch()
    const PrevRecord=useSelector((state)=>state.tasks.PrevRecord)||[]
    const selectedTask=useSelector((state)=>state.tasks.selectedTask)
    const reloadInterval=useSelector((state)=>state.tasks.reloadInterval)
    const [searchTextPR, setSearchTextPR] = useState("");
    const [filterStatusPR, setFilterStatusPR] = useState("");
    const [filteredTasksPR, setFilteredTasksPR] = useState([]);
    useEffect(()=>{
            const apiCall=async()=>{
                const resp= await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/task/client-deadline/before-30days`,{
                  headers: {
                    Authorization: `Bearer ${Cookies.get("token")}`, // Fetch token from cookies
                }
                })
                if(resp?.data){dispatch(setPrevRecord(resp.data.data));
                console.log({prprprprprpprprpr:resp.data.data})
                }
                else{
                    console.log({error:resp})
                }
            }
            // apiCall()
            if(selectedTask==="Prev Record" && !PrevRecord.length){console.log("called api");apiCall();}

    },[reloadInterval])
    useEffect(() => {
        const filterTasks = () => {
          const filtered = PrevRecord.filter((task) => {
            const { taskID, clientDetails, status } = task;
    
            // Prepare searchable fields
            const searchFields = [
              taskID,
              clientDetails?.clientID,
              clientDetails?.name,
            ];
    
            // Check if the task matches the search text
            const matchesSearch = searchFields.some((field) =>
              field?.toLowerCase().includes(searchTextPR.toLowerCase())
            );
    
            // Check if the task matches the filter status
            const matchesFilter = filterStatusPR ? status === filterStatusPR : true;
    
            return matchesSearch && matchesFilter;
          });
    
          setFilteredTasksPR(filtered);
        };
    
        if(PrevRecord)filterTasks();
      }, [PrevRecord, searchTextPR, filterStatusPR]); // Re-run when tasks, searchTextPR, or filterStatusPR changes
    
    return (
        <div className="p-1 text-[12px] bg-gray-100 min-h-screen">
          {/* Search and Filter */}
          <div className="flex items-center gap-1 mb-1">
            {/* Search Bar */}
            <input
              type="text"
              placeholder="Search by TaskID, ClientID, or ClientName"
              className="flex-1 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTextPR}
              onChange={(e) => setSearchTextPR(e.target.value)}
            />
           {/* Filter Icon with Hover Options */}
<div className="relative group">
  {/* Filter Icon */}
  <div className="p-2 bg-gray-300 rounded-full cursor-pointer hover:bg-gray-400">
    {!filterStatusPR?<IoFilterSharp size={15}/>:<MdFilterListOff size={15}/>}
  </div>

  {/* Filter Options */}
  <div className="absolute w-[100px] right-2 mt-1 bg-white border border-gray-300 rounded-lg shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
    <ul className="py-1">
      <li
        className="px-2 py-1 hover:bg-indigo-200 active:bg-indigo-400 cursor-pointer"
        onClick={() => setFilterStatusPR("")}
      >
        All Status
      </li>
      <li
        className="px-2 py-1 hover:bg-indigo-200 active:bg-indigo-400 cursor-pointer"
        onClick={() => setFilterStatusPR("New Task")}
      >
        New Task
      </li>
      <li
        className="px-2 py-1 hover:bg-indigo-200 active:bg-indigo-400 cursor-pointer"
        onClick={() => setFilterStatusPR("Advance Received")}
      >
        Advance Received
      </li>
      <li
        className="px-2 py-1 hover:bg-indigo-200 active:bg-indigo-400 cursor-pointer"
        onClick={() => setFilterStatusPR("Tutor Notified")}
      >
        Tutor Notified
      </li>
      <li
        className="px-2 py-1 hover:bg-indigo-200 active:bg-indigo-400 cursor-pointer"
        onClick={() => setFilterStatusPR("Task Completed")}
      >
        Task Completed
      </li>
      <li
        className="px-2 py-1 hover:bg-indigo-200 active:bg-indigo-400 cursor-pointer"
        onClick={() => setFilterStatusPR("Being Modified")}
      >
        Being Modified
      </li>
      <li
        className="px-2 py-1 hover:bg-indigo-200 active:bg-indigo-400 cursor-pointer"
        onClick={() => setFilterStatusPR("Cancel")}
      >
       Cancel
      </li>
      <li
        className="px-2 py-1 hover:bg-indigo-200 active:bg-indigo-400 cursor-pointer"
        onClick={() => setFilterStatusPR("Refund")}
      >
       Refund
      </li>
    </ul>
  </div>
</div>

      
          </div>
    
          {/* Task Cards */}
          <div className="  h-[84vh] overflow-auto gap-1">
          
            {filteredTasksPR?.map((task) => (
              <Next24hrCard key={task._id} task={task}/>
            ))}
          </div>
        </div>
      );
    };
export default PrevRecord