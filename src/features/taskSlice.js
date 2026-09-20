import { createSlice, current } from "@reduxjs/toolkit";
import Query from "../thirdSection/Section/taskDetails/Query";

const taskSlice = createSlice({
  name: "tasks",
  initialState: {
    Query:[],
    Next24hr: [],
    UpcomingTask: [],
    PastTask: [],
    UnassignedTask: [],
    PrevRecord: [],
    TutorList:[],
    totalNoOfTutorPage:1,
    selectedTask: "Upcoming Task",
    reloadInterval:null,
    openTaskUpdateCard:false,
    selectedTaskDetails:{},
    notifyTutorPersonaly:null,
    notifyTutorDetails:[],
    commanSearch:""
  },
  reducers: {
    addInterestedTutorIfNotExists(state, action) {
      const { taskID, newTutor } = action.payload;
      console.log("💡 Step 1: Reducer triggered with", { taskID, newTutor });
    
      const keysToSearch = ["Next24hr", "UpcomingTask", "PastTask", "UnassignedTask"];
    
      keysToSearch.forEach((key) => {
        const taskArray = state[key];
        if (!Array.isArray(taskArray)) {
          console.warn(`⚠️ ${key} is not an array`);
          return;
        }
    
        taskArray.forEach((task) => {
          console.log("🔍 Checking task:", task.taskID);
    
          if (task.taskID === taskID) {
            console.log("✅ Match found in", key);
    
            if (!Array.isArray(task.intrestedTutors)) {
              console.log("📦 intrestedTutors not found, initializing...");
              task.intrestedTutors = [];
            }
    
            const alreadyExists = task.intrestedTutors.some(
              (tutor) => tutor.chatId === newTutor.chatId
            );
    
            if (!alreadyExists) {
              task.intrestedTutors.push(newTutor);
              console.log("🆕 Tutor added to", key, newTutor);
            } else {
              console.log("🚫 Tutor already exists in", key);
            }
          }
        });
      });
    }
    ,
    addQuery: (state, action) => {
      const query = action.payload;
      console.log({ query });
    
      // Ensure state.Query is always an array before updating
      state.Query = state.Query ? [query, ...state.Query] : [query];
    }, 
    setCommanSearch: (state, action) => {
      const commanSearchValue = action.payload; 
      // Ensure state.Query is always an array before updating
      state.commanSearch =  commanSearchValue
    },    
    updateQuery: (state, action) => {
       
    },
    
    setCloseTaskUpdateCard:(state,action)=>{
      state.openTaskUpdateCard=false
      state.notifyTutorDetails=[]
      state.notifyTutorPersonaly=null
    },
    setNotifyTutorDetails: (state, action) => {
      const existingIndex = state.notifyTutorDetails.findIndex(
        (tutor) => tutor.tutorID === action.payload.tutorID
      );
    
      if (existingIndex !== -1) {
        // If tutor exists, remove them
        state.notifyTutorDetails.splice(existingIndex, 1);
      } else {
        // If tutor does not exist, add them
        state.notifyTutorDetails.push(action.payload);
      }
    },
    setNotifyTutorPersonaly: (state, action) => {
      state.notifyTutorPersonaly = action.payload;
      state.selectedTask="Tutor List"
    },
    setQuery: (state, action) => {
      state.Query = action.payload;
    },
    setNext24hr: (state, action) => {
      state.Next24hr = action.payload;
    },
    setUpcomingTask: (state, action) => {
      state.UpcomingTask = action.payload;
    },
    setPastTask: (state, action) => {
      state.PastTask = action.payload;
    },
    setUnassignedTask: (state, action) => {
      state.UnassignedTask = action.payload;
    },
    setPrevRecord: (state, action) => {
      state.PrevRecord = action.payload;
    },
    setTutorList: (state, action) => {
      state.TutorList = action.payload;
    },
    setTotalNoOfTutorPage: (state, action) => {
      state.totalNoOfTutorPage = action.payload;
    }, 
    setSelectedTask: (state, action) => {
      state.selectedTask = action.payload;
    },
    setReloadInterval: (state, action) => {
        state.reloadInterval = action.payload;
      },
      setOpenTaskUpdateCard: (state, action) => {
        state.openTaskUpdateCard = action.payload;
      },
      setSelectedTaskDetails: (state, action) => {
        state.selectedTaskDetails = action.payload;
      },
      resetTaskState: (state) => {
        return {
          Next24hr: [],
          UpcomingTask: [],
          PastTask: [],
          UnassignedTask: [],
          PrevRecord: [],
          TutorList: [],
          totalNoOfTutorPage: 1,
          selectedTask: "",
          reloadInterval: null,
          openTaskUpdateCard: false,
          selectedTaskDetails: {},
        };
      },
      updateTaskData: (state, action) => {
        const { taskID, taskData } = action.payload;
        const taskLists = ["Next24hr", "UpcomingTask", "PastTask", "UnassignedTask"];
  
        for (const list of taskLists) {
          const taskIndex = state[list].findIndex(task => task.taskID === taskID);
          if (taskIndex !== -1) {
            state[list][taskIndex] = {
              ...state[list][taskIndex],
              status: taskData.status,
              tutorDetails: taskData.tutorDetails,
              agentComment: taskData.agentDetails?.comment || "",
              clientDetails:taskData.clientDetails,
              tutorDeadline:taskData.tutorDeadline,
              clientDeadline:taskData.clientDeadline,
              subject:taskData.subject
            };
            return; // Stop searching after updating the found task
          }
        }
      },
  },
});

export const {
  addInterestedTutorIfNotExists,
  setCommanSearch,
  setCloseTaskUpdateCard,
  setNotifyTutorDetails,
  setQuery,
  addQuery,
  updateQuery,
  setNext24hr,
  setUpcomingTask,
  setPastTask,
  setUnassignedTask,
  setPrevRecord,
  setTutorList,
  setTotalNoOfTutorPage,
  setSelectedTask,
  setReloadInterval,
  setOpenTaskUpdateCard,
  setSelectedTaskDetails,
  resetTaskState,
  updateTaskData,
  setNotifyTutorPersonaly
} = taskSlice.actions;

export default taskSlice.reducer;
