import React, { useEffect, useState } from "react";
import {
  FiUser,
  FiBook,
  FiDollarSign,
  FiClock,
  FiType,
  FiBookOpen,
  FiUserCheck,
  FiMessageSquare,
  FiCalendar,
  FiLink,
  FiUsers,
  FiAlertCircle,
  FiClipboard,
} from "react-icons/fi";
import { FaUniversity, FaRegCopy, FaEdit, FaWallet, FaSearch } from "react-icons/fa";
import { IoIosSave, IoIosSend } from "react-icons/io";
import { MdOutlineGeneratingTokens } from "react-icons/md";
import { FaArrowsDownToPeople } from "react-icons/fa6";
import { IoMdNotifications } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import { useSelector, useDispatch } from "react-redux";
import { addContact } from "../../features/contactsSlice";
import { addMessage } from "../../features/messagesSlice";
import {
  updateTaskData,
  setNotifyTutorPersonaly,
  setCloseTaskUpdateCard,
} from "../../features/taskSlice";
import axios from "axios";
import RatingPopup from "./RatingPopup";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

const UNIVERSITY_LIST = [
  "Abertay University", "Abu Dhabi Polytechnic", "Abu Dhabi School of Management", "Abu Dhabi University (ADU)", "Academy of Learning College (AOLC)", "Adelaide University", "Adelphi University", "Ajman University", "Al Ain University", "Al Dar University College", "Al Falah University", "Al Ghurair University", "Al Khawarizmi International College", "Al Qasimia University", "Albert Ludwig University of Freiburg", "Algoma University", "Algonquin College", "Algonquin College – Kuwait (AC)", "American College of Dubai", "American College of the Middle East (ACM)", "American International University (AIU)", "American University in Dubai (AUD)", "American University in the Emirates (AUE)", "American University of Kuwait (AUK)", "American University of Ras Al Khaimah (AURAK)", "American University of Sharjah (AUS)", "American University of the Middle East (AUM)", "Amherst College", "Anglia Ruskin University (ARU)", "Arden University", "Arden University Berlin", "Arizona State University (ASU)", "Arkansas State University", "Aston University", "Atlantic Technological University (ATU)", "Auburn University", "Australian Catholic University (ACU)", "Australian College of Kuwait (ACK)", "Australian National University (ANU)", "Avila University", "Berlin International University of Applied Sciences", "Berlin School of Business and Innovation (BSBI)", "Beta College", "Binghamton University", "Birmingham City University", "Birmingham Newman University", "Bond University", "Boston University", "Box Hill College Kuwait (BHCK)", "BPP University", "Brown University", "Brunel University London", "Buckinghamshire New University", "California State University (CSU)", "Cambrian College", "Campbellsville University", "Canadian University Dubai (CUD)", "Canadore College", "Cape Breton University (CBU)", "Cardiff Metropolitan University", "Cardiff University", "Carleton University", "Carnegie Mellon University (CMU)", "Catholic University of America", "CDM College Canada", "Centennial College", "Central Christian College of Kansas", "Central Michigan University (CMU)", "Central Queensland University (CQU)", "Charles Darwin University (CDU)", "Charles Sturt University (CSU)", "City University College of Ajman", "City University of New York (CUNY)", "City, University of London", "Clark University", "Clarkson University", "Clemson University", "Cleveland State University (CSU)", "College of Computing Technology Dublin (CCT)", "Colorado State University (CSU)", "Columbia University", "Columbus State Community College", "Concordia University", "Concordia University of Edmonton (CUE)", "Conestoga College", "Cornell University", "Coventry University", "Crandall University", "Cranfield University", "Cumberland University", "Curtin University", "Dalhousie University", "Dallas Baptist University (DBU)", "Dartmouth College", "Davidson College", "De Montfort University", "Deakin Business School", "Deakin University", "DePaul University", "Dresden University of Technology (TU Dresden)", "Drexel University", "Dublin Business School (DBS)", "Dublin City University (DCU)", "Duke University", "Dundalk Institute of Technology (DKIT)", "Durham College", "Durham University", "Edge Hill University", "Edinburgh Napier University", "Edith Cowan University (ECU)", "European School of Economics", "European University College", "Falmouth University", "Fanshawe College", "Federation University Australia", "Flinders University", "Florida Atlantic University (FAU)", "Florida International University (FIU)", "Free University of Berlin", "Friedrich-Alexander University Erlangen–Nuremberg (FAU)", "Gannon University", "George Brown College (GBC)", "George Mason University (GMU)", "George Washington University (GWU)", "Georgia State University (GSU)", "Georgian College", "GISMA University of Applied Sciences", "Glasgow Caledonian University", "Goethe University Frankfurt", "Golden Gate University", "Governors State University (GSU)", "Grand Valley State University (GVSU)", "Griffith College", "Griffith University", "Gulf University for Science and Technology (GUST)", "Guru Gobind Singh Indraprastha University (GGSIPU)", "Guru Jambheshwar University of Science and Technology (GJUST)", "Heidelberg University", "Higher Colleges of Technology (HCT)", "Hochschule Fresenius", "Holmes Institute", "Hult International Business School", "Humber College", "Humboldt University of Berlin", "IHM Australia", "Illinois Institute of Technology (Illinois Tech / IIT Chicago)", "Imam Abdulrahman Bin Faisal University (IAU)", "Imperial College London", "Imperial Valley College", "Indiana Institute of Technology (Indiana Tech)", "Indiana University–Purdue University Indianapolis (IUPUI)", "Indiana Wesleyan University (IWU)", "International Business University (IBU)", "IU International University of Applied Sciences (IU)", "James Cook University (JCU)", "Johannes Gutenberg University Mainz", "Johns Hopkins University (JHU)", "Jumeira University", "Kansas State University (K-State)", "Kaplan Business School (KBS)", "Kaplan International College London", "Karlsruhe Institute of Technology (KIT)", "Keele University", "Kennesaw State University (KSU)", "Kent State University (KSU)", "King Saud University (KSU)", "King's Business School", "King's College London (KCL)", "Kingston University", "Kuwait College of Science and Technology (KCST)", "Kuwait Maastricht Business School", "Kuwait University (KU)", "La Trobe University (LTU)", "Lambton College", "Lancaster University", "LaSalle College Vancouver", "Leeds Beckett University", "Leeds Trinity University", "Lewis University", "Lincoln University of Business and Management", "Lindsey Wilson College", "Liverpool Hope University", "Liverpool John Moores University", "Liwa College of Technology", "London Business School (LBS)", "London Metropolitan University", "London School of Economics and Political Science (LSE)", "London South Bank University (LSBU)", "Long Island University – Post (LIU Post)", "Loyalist College", "Macquarie University", "Manchester Metropolitan University", "Mannheim University", "Marquette University", "Maynooth University", "McGill University", "McMaster University", "Michigan State University (MSU)", "Michigan State University Dubai", "Middlesex University", "Midway University", "Midwestern State University (MSU Texas)", "Mississippi State University (MSU)", "Missouri Southern State University (MSSU)", "Mohawk College", "Monash University", "Monroe University", "Montclair State University (MSU)", "Murdoch University", "National College of Ireland (NCI)", "National University of Ireland Galway (now University of Galway)", "New England College", "New Jersey Institute of Technology (NJIT)", "New Mexico State University (NMSU)", "New York Institute of Technology (NYIT)", "New York University Abu Dhabi (NYU Abu Dhabi)", "Newcastle University", "Niagara College Canada", "Northeastern University (NEU)", "Northern Arizona University (NAU)", "Northern College", "Northern Illinois University (NIU)", "Northumbria University", "Northwest Missouri State University (NWMSU)", "Northwest University", "Nottingham Trent University", "Oklahoma Christian University", "Oklahoma City University (OCU)", "Oklahoma State University (OSU)", "Ontario eSecondary School (OeSS)", "Ontario Tech University (OTU)", "Oxford Brookes University", "Pace University", "Park University", "Pennsylvania State University (Penn State)", "Pennsylvania Western University (PennWest)", "Plymouth Marjon University", "Purdue University", "Queen Margaret University", "Queen Mary University of London", "Queen's University", "Queen's University Belfast", "Queensland University of Technology (QUT)", "Quinnipiac University", "Rashid Bin Saeed Al Maktoum Naval College", "Regent's University London", "Regis University", "Rice University", "Rivier University", "RMIT University (RMIT)", "Robert Gordon University", "Robert Morris University", "Roosevelt University", "Rose Bruford College", "Rowan University", "Rutgers University", "RWTH Aachen University", "Sacred Heart University", "SAE Institute Dubai", "Saint Joseph University Dubai", "Saint Louis University (SLU)", "Saint Petersburg State Economic University – Dubai", "San Diego State University (SDSU)", "San Francisco State University (SFSU)", "Santa Clara University", "Seattle University", "Seneca Polytechnic", "Sharjah Education Academy", "Sheffield Hallam University", "Sheridan College", "Simon Fraser University (SFU)", "South East Technological University – Carlow (SETU)", "South East Technological University – Waterford (SETU)", "South Metropolitan TAFE", "Southeast Missouri State University (SEMO)", "Southern Arkansas University", "Southern Connecticut State University", "Southern Cross University (SCU)", "Southern Illinois University Edwardsville (SIUE)", "Southern Methodist University (SMU)", "Southern New Hampshire University (SNHU)", "Southern Queensland University (UniSQ)", "SRH University", "St George's, University of London", "St Mary's University, Twickenham", "St. Clair College", "St. Cloud State University (SCSU)", "St. Lawrence College (SLC)", "Staffordshire University", "Stevens Institute of Technology", "Stevens Institute of Technology (Stevens)", "Stony Brook University (SBU)", "Strathclyde Business School Dubai", "Swansea University", "Swinburne University of Technology", "Syracuse University", "TAFE South Australia", "Tarrant County College", "Technical University of Berlin (TU Berlin)", "Technical University of Darmstadt (TU Darmstadt)", "Technical University of Munich (TUM)", "Technological University Dublin (TU Dublin)", "Technological University of Shannon – Athlone (TUS)", "Technological University of Shannon – Limerick (TUS)", "Technological University of Shannon (TUS)", "Teesside University", "Texas A&M International University (TAMIU)", "Texas A&M University (TAMU)", "Texas A&M University–Corpus Christi (TAMU-CC)", "Texas A&M University–Kingsville (TAMUK)", "Texas State University", "Texas Tech University (TTU)", "The George Washington University (GWU)", "The Ohio State University (OSU)", "The University of Buckingham", "The University of Manchester Worldwide", "The University of Northampton", "The University of York", "Thomas More University", "Thompson Rivers University (TRU)", "Toronto Metropolitan University (TMU)", "Torrens University", "Trent University", "Trinity College Dublin (TCD)", "Umm Al Quwain University", "Umm Al-Qura University (UQU)", "United Arab Emirates University (UAEU)", "Université de Montréal", "University at Albany (UAlbany)", "University at Buffalo (UB)", "University Canada West (UCW)", "University College Birmingham", "University College Cork (UCC)", "University College Dublin (UCD)", "University College London (UCL)", "University of Aberdeen", "University of Adelaide", "University of Alabama", "University of Alberta (UAlberta)", "University of Arizona", "University of Arkansas", "University of Balamand Dubai", "University of Baltimore", "University of Bath", "University of Bedfordshire", "University of Birmingham", "University of Birmingham Dubai", "University of Bonn", "University of Bradford", "University of Bridgeport", "University of Bridgeport (UB)", "University of Brighton", "University of Bristol", "University of British Columbia (UBC)", "University of Calgary (UCalgary)", "University of California", "University of Cambridge", "University of Canberra (UC)", "University of Central Florida (UCF)", "University of Central Lancashire (UCLan)", "University of Central Missouri (UCM)", "University of Central Oklahoma (UCO)", "University of Chester", "University of Chicago", "University of Chichester", "University of Cincinnati", "University of Cologne", "University of Colorado Boulder (CU Boulder)", "University of Colorado Denver", "University of Connecticut (UConn)", "University of Cumbria", "University of Dayton", "University of Denver", "University of Derby", "University of Dubai", "University of Duisburg-Essen", "University of Dundee", "University of East Anglia (UEA)", "University of East London (UEL)", "University of Edinburgh", "University of Essex", "University of Europe for Applied Sciences (UE)", "University of Exeter", "University of Exeter Dubai", "University of Florida (UF)", "University of Fujairah", "University of Galway", "University of Georgia (UGA)", "University of Glasgow", "University of Gloucestershire", "University of Göttingen", "University of Greater Manchester", "University of Greenwich", "University of Guelph", "University of Hamburg", "University of Hertfordshire", "University of Houston (UH)", "University of Houston–Clear Lake (UHCL)", "University of Houston–Downtown (UHD)", "University of Huddersfield", "University of Hull", "University of Illinois Chicago (UIC)", "University of Illinois Springfield (UIS)", "University of Iowa", "University of Kansas (KU)", "University of Kent", "University of Kiel", "University of Leeds", "University of Leicester", "University of Lethbridge", "University of Limerick (UL)", "University of Lincoln", "University of Liverpool", "University of London", "University of Manchester", "University of Manitoba", "University of Maryland (UMD)", "University of Massachusetts Amherst (UMass Amherst)", "University of Massachusetts Boston (UMass Boston)", "University of Massachusetts Lowell (UMass Lowell)", "University of Melbourne", "University of Memphis (UofM)", "University of Miami", "University of Michigan (U-M)", "University of Mississippi (Ole Miss)", "University of Missouri–Kansas City (UMKC)", "University of Nevada", "University of New Brunswick (UNB)", "University of New Hampshire (UNH)", "University of New Haven (UNH)", "University of New South Wales (UNSW)", "University of Newcastle", "University of Niagara Falls Canada (UNF)", "University of North Carolina (UNC)", "University of North Texas (UNT)", "University of Northern British Columbia (UNBC)", "University of Northern Iowa (UNI)", "University of Notre Dame", "University of Nottingham", "University of Ottawa (uOttawa)", "University of Oxford", "University of Pennsylvania (Penn)", "University of Pittsburgh (Pitt)", "University of Plymouth", "University of Portsmouth", "University of Queensland (UQ)", "University of Regina", "University of Rochester", "University of Roehampton", "University of Salford", "University of Saskatchewan (USask)", "University of Science and Technology of Fujairah", "University of Sharjah (UOS)", "University of Sheffield", "University of South Australia (UniSA)", "University of South Carolina (USC)", "University of South Dakota (USD)", "University of South Florida (USF)", "University of Southampton", "University of Southern California (USC)", "University of Southern Mississippi (USM)", "University of St Andrews", "University of St. Thomas", "University of Stirling", "University of Strathclyde", "University of Stuttgart", "University of Suffolk", "University of Sunderland", "University of Surrey", "University of Sussex", "University of Sydney", "University of Tasmania", "University of Technology Sydney (UTS)", "University of Tennessee, Knoxville (UTK)", "University of Texas", "University of Texas at Arlington (UTA)", "University of Texas at Austin (UT Austin)", "University of Texas at Dallas (UTD)", "University of Texas at El Paso (UTEP)", "University of Texas at Tyler (UT Tyler)", "University of the Highlands and Islands (UHI)", "University of the Pacific", "University of the Sunshine Coast (UniSC)", "University of the West of England (UWE Bristol)", "University of the West of Scotland (UWS)", "University of Toronto (UofT)", "University of Victoria (UVic)", "University of Virginia (UVA)", "University of Wales Trinity Saint David (UWTSD)", "University of Warwick", "University of Washington (UW)", "University of Waterloo (UW)", "University of West Florida (UWF)", "University of West London (UWL)", "University of Western Australia (UWA)", "University of Westminster", "University of Winchester", "University of Windsor", "University of Winnipeg", "University of Wisconsin–Madison (UW–Madison)", "University of Wisconsin–Milwaukee (UWM)", "University of Wollongong (UOW)", "University of Wollongong in Dubai (UOWD)", "University of Wolverhampton", "University of Worcester", "University of York", "Utah State University (USU)", "Valparaiso University", "Victoria University", "Victoria University (VU)", "Victorian Institute of Technology (VIT)", "Virginia Tech", "Washington University in St. Louis – Olin Business School (WashU Olin)", "Washington University in St. Louis (WashU)", "Wayne State University", "Webster University", "Wesleyan University", "Westcliff University", "Western Governors University (WGU)", "Western Michigan University (WMU)", "Western Sydney University", "Western University", "Western University (Western)", "Westford University College", "Wichita State University (WSU)", "Wilmington University", "Wright State University (WSU)", "Writtle University College", "Yale University", "Yeshiva University", "York Business School", "York St John University", "York University", "York University (YorkU)", "Yorkville University", "Youngstown State University (YSU)", "Zayed University (ZU)"
];

const demoData = {
  taskID: "C-1410331",
  clientDetails: {
    clientID: "C-134303512",
    name: "laxman Doe",
    subject: "english",
    instituteName: "",
    totalAmount: 5000,
    receivedAmount: 1000,
    duration: 48,
    type: "session",
  },
  tutorDetails: {
    tutorID: "T-67289032",
    name: "Ramu",
    totalAmount: 4000,
    amountPaid: 1500,
  },
  status: "Tutor Notified",
  agentDetails: {
    name: "Agent Smith",
    comment: "This is a priority task",
  },
  driveLink: "https://drive.google.com/samplelink",
  clientDeadline: "2025-01-29T18:27:37.452454Z",
  tutorDeadline: "2022-01-28T18:00:00.000Z",
};

const community = {
  CS_Coding_Assignment: "120363394313268201@g.us",
  Other_Engineering_Assignment: "120363394313268201@g.us",
  MBA_Assignments: "120363394313268201@g.us",
  Writing_or_Technical_Writing_Assignment: "120363394313268201@g.us",
};

const currencies = [
  "USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "CHF", "CNY", "SEK",
  "NZD", "SGD", "HKD", "NOK", "KRW", "TRY", "RUB", "ZAR", "BRL", "MXN",
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// MOVED OUTSIDE: This prevents the input from losing focus on every keystroke
const FieldRow = ({ icon, label, children }) => (
  <div className="grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-[125px_1fr] sm:gap-3 sm:text-sm">
    <div className="flex items-center gap-2 font-bold text-slate-600">
      {icon}
      <span>{label}</span>
    </div>
    <div className="min-w-0 break-words font-semibold text-slate-800">
      {children}
    </div>
  </div>
);

const TaskUpdateCard = () => {
  const dispatch = useDispatch();

  const [rating, setRating] = useState(false);
  const [taskData, setTaskData] = useState(demoData);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState("");
  // const [notifyPersonaly, setNotifyPersonaly] = useState(false);
  const [showUniversityBox, setShowUniversityBox] = useState(false);
  const [uniSearchTerm, setUniSearchTerm] = useState("");

  const deviceDetails = useSelector((state) => state.contacts.deviceDetails);
  const notifyTutorDetails = useSelector((state) => state.tasks.notifyTutorDetails);
  const notifyTutorPersonaly = useSelector((state) => state.tasks.notifyTutorPersonaly);
  const selectedTaskDetails = useSelector((state) => state.tasks.selectedTaskDetails);

  useEffect(() => {
    if (selectedTaskDetails) {
      setTaskData(selectedTaskDetails);
    }
  }, [selectedTaskDetails]);

  // Filter University List Local Search
  const filteredUniversities = UNIVERSITY_LIST.filter((uni) =>
    uni.toLowerCase().includes(uniSearchTerm.toLowerCase())
  );

  const convertToLocalISOString = (date) => {
    if (!date) return "";
    const localDate = new Date(date);
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
    return localDate.toISOString().slice(0, 16);
  };

  const FormateTime = (time) => {
    if (!time) return "NA";
    return new Date(time).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Tutor Assigned":
        return { border: "border-l-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-500", text: "text-emerald-600" };
      case "Task Completed":
        return { border: "border-l-indigo-400", badge: "bg-indigo-50 text-indigo-700 border-indigo-100", dot: "bg-indigo-500", text: "text-indigo-600" };
      case "Being Modified":
        return { border: "border-l-orange-400", badge: "bg-orange-50 text-orange-700 border-orange-100", dot: "bg-orange-500", text: "text-orange-600" };
      case "Cancel":
      case "Refund":
        return { border: "border-l-red-400", badge: "bg-red-50 text-red-700 border-red-100", dot: "bg-red-500", text: "text-red-600" };
      case "Advance Received":
      case "Tutor Notified":
        return { border: "border-l-yellow-400", badge: "bg-yellow-50 text-yellow-700 border-yellow-100", dot: "bg-yellow-500", text: "text-yellow-600" };
      default:
        return { border: "border-l-slate-300", badge: "bg-slate-50 text-slate-700 border-slate-100", dot: "bg-slate-400", text: "text-slate-600" };
    }
  };

  const statusStyle = getStatusStyle(taskData?.status);

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50";

  const sectionClass =
    "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm";

  const sectionTitleClass =
    "mb-4 flex items-center gap-2 text-sm font-extrabold text-slate-900";

  const handleSelect = (event) => {
    const selectedKey = event.target.value;
    setSelectedCommunity(selectedKey);
  };

  const handleInputChange = (e, field = null, nestedField = null) => {
    const { name, type, checked } = e.target;
    const value = type === "checkbox" ? checked : e.target.value;

    if (field && nestedField) {
      setTaskData((prev) => ({
        ...prev,
        [field]: {
          ...(prev?.[field] || {}),
          [nestedField]: value,
        },
      }));
      return;
    }

    if (name?.includes(".")) {
      const [parentKey, childKey] = name.split(".");
      setTaskData((prev) => ({
        ...prev,
        [parentKey]: {
          ...(prev?.[parentKey] || {}),
          [childKey]: value,
        },
      }));
      return;
    }

    setTaskData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleEdit = () => setIsEditing(!isEditing);

  function formatPhoneNumber(phone) {
    if (!phone) return null;
    let cleaned = phone.toString().replace(/\D/g, "");

    if (cleaned.length === 10) return `+91${cleaned}`;
    if (cleaned.length === 12 && cleaned.startsWith("91")) return `+${cleaned}`;
    if (cleaned.length === 13 && cleaned.startsWith("+91")) return cleaned;

    return null;
  }

  const handleSendMessage = async (phone_number) => {
    try {
      const formattedPhone = formatPhoneNumber(phone_number) || phone_number;
      let sendMSg =
        deviceDetails?.device === "device 1"
          ? `/tutor_notify ${taskData.taskID}`
          : `/tutor__notify ${taskData.taskID}`;

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/sendmessage`,
        {
          phone_number: formattedPhone,
          message: {
            type: "text",
            text: { body: sendMSg },
          },
          direction: "sent",
          components: [
            {
              type: "header",
              parameters: [
                {
                  type: "text",
                  text: `${notifyTutorPersonaly.taskName} ${
                    taskData.clientDetails.type === "session" ? "Session" : "Task"
                  }`,
                },
              ],
            },
            {
              type: "body",
              parameters: [
                { type: "text", text: notifyTutorPersonaly.taskID },
                { type: "text", text: notifyTutorPersonaly.deadline },
                { type: "text", text: notifyTutorPersonaly.amount },
                { type: "text", text: notifyTutorPersonaly.detailsLink },
                { type: "text", text: notifyTutorPersonaly.taskID },
              ],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      let data = response.data.contact;
      data.last_message_id = response.data.savedMessage;

      if (data) {
        dispatch(addContact(data));
        dispatch(
          addMessage({
            chatId: response.data.savedMessage.contact_id,
            message: response.data.savedMessage,
          })
        );
      }

      toast.success("Tutor Notified Successfully.", {
        duration: 2000,
        position: "top-center",
        style: { background: "green", color: "white", fontWeight: "bold", padding: "12px" },
      });
    } catch (error) {
      toast.error(`${error.response?.data || error.message}`, {
        duration: 2000,
        position: "top-center",
        style: { background: "hotpink", color: "white", fontWeight: "bold", padding: "12px" },
      });
      console.error("Error sending message:", error.response?.data || error.message);
    }
  };

  const sentTemplateToTutors = async () => {
    for (const tutor of notifyTutorDetails) {
      await handleSendMessage(tutor.whatsappNo);
      await delay(1000);
    }
  };

  const notifyTutorPersonalyFunction = async () => {
  // Tutors already selected: send notification
  if (notifyTutorPersonaly && notifyTutorDetails.length > 0) {
    await sentTemplateToTutors();
    return;
  }

  const taskDetails = {
    taskName: taskData.subject,
    taskID: taskData.taskID,
    deadline: FormateTime(taskData.tutorDeadline),
    amount: taskData.tutorDetails.totalAmount,
    detailsLink: taskData.driveLink,
  };

  // Activate tutor-selection mode
  dispatch(setNotifyTutorPersonaly(taskDetails));

  // Close TaskUpdateCard and remove black/b

  toast.success("Now select tutors from the tutor list.", {
    duration: 5000,
    position: "top-center",
    style: {
      background: "green",
      color: "white",
      fontWeight: "bold",
      padding: "12px",
    },
  });
};

  const notifyTutor = async () => {
    if (!selectedCommunity || !taskData.tutorDetails.totalAmount || taskData.tutorDetails.totalAmount === 0) {
      toast.error("⚠️ Please select forum name and mention tutor amount.", {
        duration: 3000,
        position: "top-center",
        style: { background: "#F472B6", color: "white", fontWeight: "bold", padding: "12px" },
      });
      return;
    }

    toast.loading("⏳ Please wait...", {
      duration: 2000,
      position: "top-center",
      style: { background: "#FBBF24", color: "white", fontWeight: "bold", padding: "12px" },
    });

    const message =
      `*${taskData.subject} ${taskData.clientDetails.type === "session" ? "Session" : "Task"}*\n` +
      `*Task ID - ${taskData.taskID}*\n` +
      `${
        taskData.clientDetails.type === "session"
          ? `*Session Start Time- ${FormateTime(taskData.clientDetails.sessionStartTime)}*\n*Duration:- ${taskData.clientDetails.duration} hr*\n`
          : `*Deadline - ${FormateTime(taskData.tutorDeadline)}*\n`
      }` +
      `*Amount - ${taskData.tutorDetails.totalAmount} INR*\n` +
      `*Task details -* ${taskData.driveLink}\n\n` +
      `*✔️ Carefully review all details in the provided link before starting.*\n` +
      `*✔️ Do NOT begin the task without confirmation.*\n` +
      `*✔️ Ensure originality—no plagiarism allowed.*\n` +
      `*✔️ AI-generated or AI-paraphrased content is strictly prohibited.*\n` +
      `*✔️ Minimum requirement: 85% marks.*\n\n` +
      `*⚠️ Do NOT reply on the community.*\n` +
      `*👉Reply to the given link if task is doable: https://wa.me/${deviceDetails?.phone_number}?text=I%20am%20interested%20in%20this%20Task%20with%20TaskID%3A-%20${taskData.taskID}*`;

    try {
      let firstMsg = selectedCommunity;

      const firstResponse = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/sendmessage`,
        {
          phone_number: "+919508569164",
          message: { type: "text", text: { body: firstMsg } },
          direction: "sent",
          components: [],
        },
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${Cookies.get("token")}` } }
      );

      let firstData = firstResponse.data.contact;
      firstData.last_message_id = firstResponse.data.savedMessage;

      if (firstData) {
        dispatch(addContact(firstData));
        dispatch(addMessage({ chatId: firstResponse.data.savedMessage.contact_id, message: firstResponse.data.savedMessage }));
      }

      await delay(3000);

      if (firstResponse.data) {
        const secondResponse = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/sendmessage`,
          {
            phone_number: "+919508569164",
            message: { type: "text", text: { body: message } },
            direction: "sent",
            components: [],
          },
          { headers: { "Content-Type": "application/json", Authorization: `Bearer ${Cookies.get("token")}` } }
        );

        let secondData = secondResponse.data.contact;
        secondData.last_message_id = secondResponse.data.savedMessage;

        if (secondData) {
          dispatch(addContact(secondData));
          dispatch(addMessage({ chatId: secondResponse.data.savedMessage.contact_id, message: secondResponse.data.savedMessage }));
        }

        if (secondResponse.data) {
          toast.success("🎉 Message sent. Check chat for DONE message.", {
            duration: 3000,
            position: "top-center",
            style: { background: "#34D399", color: "white", fontWeight: "bold", padding: "12px" },
          });
          setSelectedCommunity("");
        }
      } else {
        toast.error("❌ Something wrong. Please inform developer.", {
          duration: 5000,
          position: "top-center",
          style: { background: "#F87171", color: "white", fontWeight: "bold", padding: "12px" },
        });
      }
    } catch (error) {
      console.error("Error sending tutor notification:", error);
    }
  };

  const copyToClipboard = (data) => {
    try {
      const formattedData = typeof data === "object" ? JSON.stringify(data, null, 2) : String(data);
      navigator.clipboard
        .writeText(formattedData)
        .then(() => {
          toast.success("🎉 Selected data copied.", {
            duration: 2000,
            position: "top-center",
            style: { background: "#10B981", color: "white", fontWeight: "bold", padding: "16px", borderRadius: "8px" },
          });
        })
        .catch((err) => console.error("Failed to copy data: ", err));
    } catch (error) {
      console.error("Error formatting data: ", error);
    }
  };

  const safeDateValue = (date) => {
    if (!date) return null;
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return null;
    return parsedDate;
  };

  const handleSave = async () => {
    if (taskData.status === "Cancel" && taskData.clientDetails.reasionForRefCan === "NA") {
      alert("Fill the reason of task cancellation.");
      return;
    }

    if (taskData.status === "Refund") {
      if (taskData.clientDetails.reasionForRefCan === "NA" || !taskData.clientDetails.refundAmount) {
        alert("Fill the reason of refund and refund amount.");
        return;
      }
    }

    if (taskData.status === "Advance Received") {
      if (!taskData.clientDetails.receivedAmount) {
        toast.error("Fill the received amount first.", {
          duration: 3000,
          position: "top-center",
          style: { background: "#F472B6", color: "white", padding: "12px" },
        });
        return;
      }
    }

    if (taskData.status === "Tutor Assigned") {
      if (!taskData.tutorDetails.tutorID || !taskData.tutorDetails.totalAmount || taskData.tutorDeadline === "2000-01-01T00:00:00.000Z") {
        toast.error("Fill tutor details and tutor deadline.", {
          duration: 3000,
          position: "top-center",
          style: { background: "#F472B6", color: "white", padding: "12px" },
        });
        return;
      }
    }

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/task/update-task/${taskData.taskID}`,
        {
          status: taskData.status,
          subject: taskData.subject,
          tutorDetails: taskData.tutorDetails,
          agentComment: taskData.agentDetails.comment,
          clientDetails: taskData.clientDetails,
          tutorDeadline: safeDateValue(taskData.tutorDeadline),
          clientDeadline: safeDateValue(taskData.clientDeadline),
        },
        { headers: { Authorization: `Bearer ${Cookies.get("token")}` } }
      );

      if (response.data) {
        setIsEditing(false);
        await dispatch(updateTaskData({ taskID: taskData.taskID, taskData: response?.data?.task }));
        toast.success("Updated successfully.", {
          duration: 3000,
          position: "top-center",
          style: { background: "green", color: "white", padding: "12px" },
        });
      }
    } catch (error) {
      toast.error(`${error}`, {
        duration: 3000,
        position: "top-center",
        style: { background: "#F472B6", color: "white", padding: "12px" },
      });
    }

    setIsEditing(false);
  };

  const formatTaskType = (value) => {
    if (!value) return "NA";
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] flex items-start justify-center px-2 py-2 sm:px-3 sm:py-4 md:inset-y-0 md:left-[320px] md:right-[350px] md:items-center md:py-4 xl:left-[360px] xl:right-[500px]">
      <div className="pointer-events-auto flex h-[calc(100dvh-1rem)] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:h-[92vh] sm:rounded-3xl md:h-[92vh]">
        {/* Header */}
        <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <FiClipboard className="text-slate-600" size={20} />
                <h2 className="truncate text-base font-extrabold text-slate-900 sm:text-lg">
                  Task Details
                </h2>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(taskData.taskID)}
                  className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-extrabold italic text-slate-900 ring-1 ring-slate-200 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  T_ID: {taskData.taskID}
                </button>
                <span className={`inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-extrabold ${statusStyle.badge}`}>
                  <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
                  {taskData.status}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {!isEditing ? (
                <>
                  {taskData.status === "Cancel" && (deviceDetails.role === "admin"|| deviceDetails.role === "owner") && (
                    <button type="button" onClick={toggleEdit} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-indigo-600 hover:bg-indigo-50" title="Edit">
                      <FaEdit size={18} />
                    </button>
                  )}
                  {taskData.status !== "Cancel" && (
                    <button type="button" onClick={toggleEdit} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-indigo-600 hover:bg-indigo-50" title="Edit">
                      <FaEdit size={18} />
                    </button>
                  )}
                </>
              ) : (
                <button type="button" onClick={handleSave} className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100" title="Save">
                  <IoIosSave size={21} />
                </button>
              )}
              <button type="button" onClick={() => dispatch(setCloseTaskUpdateCard())} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-red-500 hover:bg-red-50" title="Close">
                <IoCloseSharp size={22} />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <button type="button" onClick={() => copyToClipboard(taskData.driveLink)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
              Copy Link
            </button>
            <a href={taskData.driveLink} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-xs font-bold text-indigo-600 hover:bg-indigo-50">
              Open Drive
            </a>
            {isEditing && (
              <button type="button" onClick={() => setIsEditing(false)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100">
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-4 py-4 sm:px-5">
          <div className="space-y-4">

              {/* Task Status */}
<section className={sectionClass}>
  <h3 className={sectionTitleClass}>
    <FiAlertCircle className="text-indigo-500" />
    Task Status
  </h3>

  <FieldRow
    icon={<FiClipboard className="text-indigo-400" />}
    label="Status"
  >
    {isEditing ? (
      <select
        id="taskStatus"
        name="status"
        value={taskData?.status || "New Task"}
        onChange={handleInputChange}
        className={inputClass}
      >
        <option value="New Task">New Task</option>
        <option value="Advance Received">Advance Received</option>
        <option value="Tutor Notified">Tutor Notified</option>
        <option value="Tutor Assigned">Tutor Assigned</option>
        <option value="Solution Received">Solution Received</option>
        <option value="Task Completed">Task Completed</option>
        <option value="Being Modified">Being Modified</option>
        <option value="Cancel">Cancel</option>
        <option value="Refund">Refund</option>
      </select>
    ) : (
      <span
        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-extrabold ${statusStyle.badge}`}
      >
        <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
        {taskData?.status || "New Task"}
      </span>
    )}
  </FieldRow>
</section>
            {/* Client Details */}
            <section className={`${sectionClass} border-l-4 ${statusStyle.border}`}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className={sectionTitleClass}>
                  <FiUser className="text-indigo-500" />
                  Client Details
                </h3>
                <label className="flex items-center gap-2 text-xs font-bold text-indigo-600">
                  <input
                    type="checkbox"
                    name="clientDetails.fullCourse"
                    checked={taskData.clientDetails.fullCourse || false}
                    onChange={(e) => handleInputChange(e, "clientDetails", "fullCourse")}
                    className="h-4 w-4 rounded"
                  />
                  Full Course
                </label>
              </div>

              <div className="space-y-3">
                <FieldRow icon={<FiBook className="text-indigo-400" />} label="Subject">
                  {isEditing ? (
                    <input type="text" name="subject" value={taskData?.subject || ""} onChange={handleInputChange} className={inputClass} />
                  ) : (
                    taskData.subject
                  )}
                </FieldRow>

                <FieldRow icon={<FiDollarSign className="text-indigo-400" />} label="Deal Amount">
                  {isEditing ? (
                    <div className="grid grid-cols-[1fr_95px] gap-2">
                      <input
                        type="number"
                        name="clientDetails.totalAmount"
                        value={taskData.clientDetails.totalAmount ?? ""}
                        onChange={handleInputChange}
                        onWheel={(e) => e.target.blur()}
                        className={inputClass}
                      />
                      <select
                        value={taskData.clientDetails.currencyType}
                        onChange={(e) => handleInputChange(e, "clientDetails", "currencyType")}
                        className={inputClass}
                      >
                        {currencies.map((currency) => (
                          <option key={currency} value={currency}>{currency}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    `${taskData.clientDetails.totalAmount} ${taskData.clientDetails.currencyType || "INR"}`
                  )}
                </FieldRow>

                <FieldRow icon={<FaUniversity className="text-indigo-400" />} label="University">
                  {isEditing ? (
                    <input
                      type="text"
                      readOnly
                      placeholder="Select University"
                      name="clientDetails.instituteName"
                      value={taskData.clientDetails?.instituteName || ""}
                      onClick={() => {
                        setUniSearchTerm("");
                        setShowUniversityBox(true);
                      }}
                      className={`${inputClass} cursor-pointer caret-transparent`}
                    />
                  ) : (
                    taskData.clientDetails?.instituteName || "NA"
                  )}
                </FieldRow>

                <FieldRow icon={<FaWallet className="text-indigo-400" />} label="Received">
                  {isEditing ? (
                    <input
                      type="number"
                      name="clientDetails.receivedAmount"
                      value={taskData.clientDetails.receivedAmount ?? ""}
                      onChange={handleInputChange}
                      onWheel={(e) => e.target.blur()}
                      className={inputClass}
                    />
                  ) : (
                    `${taskData.clientDetails.receivedAmount} INR`
                  )}
                </FieldRow>

                {taskData.clientDetails.type === "session" && (
                  <>
                    <FieldRow icon={<FiCalendar className="text-indigo-400" />} label="Start Time">
                      {isEditing ? (
                        <input
                          type="datetime-local"
                          name="clientDetails.sessionStartTime"
                          min={convertToLocalISOString(new Date().getTime() - 10 * 60 * 1000)}
                          max={taskData.clientDeadline ? convertToLocalISOString(taskData.clientDeadline) : convertToLocalISOString(new Date())}
                          value={convertToLocalISOString(taskData.clientDetails.sessionStartTime)}
                          onChange={(e) => handleInputChange(e, "clientDetails", "sessionStartTime")}
                          className={inputClass}
                        />
                      ) : (
                        FormateTime(taskData.clientDetails.sessionStartTime)
                      )}
                    </FieldRow>
                    <FieldRow icon={<FiClock className="text-indigo-400" />} label="Duration">
                      {isEditing ? (
                        <input
                          type="number"
                          name="clientDetails.duration"
                          value={taskData.clientDetails.duration ?? ""}
                          onChange={(e) => handleInputChange(e, "clientDetails", "duration")}
                          onWheel={(e) => e.target.blur()}
                          className={inputClass}
                        />
                      ) : (
                        `${taskData.clientDetails.duration} hrs`
                      )}
                    </FieldRow>
                  </>
                )}

                <FieldRow icon={<FiType className="text-indigo-400" />} label="Type">
                  {isEditing ? (
                    <select
                      value={taskData.clientDetails.type}
                      onChange={(e) => handleInputChange(e, "clientDetails", "type")}
                      className={inputClass}
                    >
                      <option value="assignment">Assignment</option>
                      <option value="project">Project</option>
                      <option value="session">Session</option>
                    </select>
                  ) : (
                    formatTaskType(taskData.clientDetails.type)
                  )}
                </FieldRow>

                {taskData.status === "Refund" && (
                  <FieldRow icon={<FiDollarSign className="text-indigo-400" />} label="Refund">
                    {isEditing ? (
                      <input
                        type="number"
                        name="clientDetails.refundAmount"
                        value={taskData.clientDetails.refundAmount ?? ""}
                        onChange={(e) => handleInputChange(e, "clientDetails", "refundAmount")}
                        onWheel={(e) => e.target.blur()}
                        className={inputClass}
                      />
                    ) : (
                      `${taskData.clientDetails.refundAmount} INR`
                    )}
                  </FieldRow>
                )}

                {(taskData.status === "Cancel" || taskData.status === "Refund") && (
                  <FieldRow icon={<FiAlertCircle className="text-indigo-400" />} label="Reason">
                    {isEditing ? (
                      <input
                        type="text"
                        name="clientDetails.reasionForRefCan"
                        value={taskData.clientDetails.reasionForRefCan || ""}
                        onChange={(e) => handleInputChange(e, "clientDetails", "reasionForRefCan")}
                        className={inputClass}
                      />
                    ) : (
                      taskData.clientDetails.reasionForRefCan
                    )}
                  </FieldRow>
                )}
              </div>
            </section>

            {/* Tutor Details */}
            <section className={`${sectionClass} border-l-4 border-l-emerald-400`}>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className={sectionTitleClass}>
                  <FiBookOpen className="text-indigo-500" />
                  Tutor Details
                  <button type="button" onClick={() => setRating(true)}>
                    <MdOutlineGeneratingTokens size={28} className="text-yellow-500" />
                  </button>
                </h3>

                {(taskData.status === "Advance Received" || taskData.status === "Tutor Notified") && (
                  <div className="flex min-w-0 items-center gap-2">
                    <select
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 outline-none focus:border-indigo-300"
                      value={selectedCommunity}
                      onChange={handleSelect}
                    >
                      <option value="" disabled>Select Forum</option>
                      {Object.keys(community).map((key) => (
                        <option key={key} value={key}>{key.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                    <button type="button" onClick={notifyTutor} className="shrink-0 rounded-xl bg-yellow-50 p-2 text-yellow-600 hover:bg-yellow-100" title="Notify Tutor">
                      <IoMdNotifications size={22} />
                    </button>
                    <button type="button" onClick={notifyTutorPersonalyFunction} className="relative shrink-0 rounded-xl bg-yellow-50 p-2 text-yellow-600 hover:bg-yellow-100" title="Notify Personally">
                      {notifyTutorPersonaly ? (
                            <IoIosSend size={22} />
                          ) : (
                            <FaArrowsDownToPeople size={22} />
                          )}
                      {!!notifyTutorDetails?.length && (
                        <span className="absolute -right-1 -top-1 rounded-full bg-yellow-500 px-1.5 text-[10px] font-extrabold text-white">
                          {notifyTutorDetails.length}
                        </span>
                      )}
                    </button>
                  </div>
                )}
                {rating && <RatingPopup tutorID={taskData.tutorDetails.tutorID} taskID={taskData.taskID} onClose={rating} setOnClose={setRating} />}
              </div>

              <div className="space-y-3">
                <FieldRow icon={<FiUser className="text-indigo-400" />} label="Tutor ID">
                  {isEditing ? (
                    <input type="text" name="tutorDetails.tutorID" value={taskData.tutorDetails.tutorID || ""} onChange={handleInputChange} className={inputClass} />
                  ) : (
                    taskData.tutorDetails.tutorID
                  )}
                </FieldRow>
                <FieldRow icon={<FiDollarSign className="text-indigo-400" />} label="Tutor Amount">
                  {isEditing ? (
                    <input
                      type="number"
                      name="tutorDetails.totalAmount"
                      value={taskData.tutorDetails.totalAmount ?? ""}
                      onChange={handleInputChange}
                      onWheel={(e) => e.target.blur()}
                      className={inputClass}
                    />
                  ) : (
                    `${taskData.tutorDetails.totalAmount} INR`
                  )}
                </FieldRow>
                <FieldRow icon={<FaWallet className="text-indigo-400" />} label="Payment">
                  {isEditing ? (
                    <select
                      name="tutorDetails.paymentStatus"
                      value={taskData.tutorDetails.paymentStatus}
                      onChange={(e) => {
                        if (e.target.value === "confirm") {
                          setRating(true);
                          toast.success("First give rating to tutor.", {
                            duration: 2000,
                            position: "top-center",
                            style: { background: "green", color: "white", fontWeight: "bold", padding: "12px" },
                          });
                        }
                        handleInputChange(e, "tutorDetails", "paymentStatus");
                      }}
                      className={inputClass}
                    >
                      <option value="hold">Hold</option>
                      <option value="confirm">Confirm</option>
                    </select>
                  ) : (
                    <span className={taskData.tutorDetails.paymentStatus === "hold" ? "text-slate-700" : "text-emerald-700"}>
                      {taskData.tutorDetails.paymentStatus}
                    </span>
                  )}
                </FieldRow>
              </div>
            </section>

            {/* Agent Details */}
            <section className={sectionClass}>
              <h3 className={sectionTitleClass}>
                <FiUserCheck className="text-indigo-500" />
                Agent Details
              </h3>
              <div className="space-y-3">
                <FieldRow icon={<FiUser className="text-indigo-400" />} label="Name">
                  {taskData.agentDetails.name}
                </FieldRow>
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-600">
                    <FiMessageSquare className="text-indigo-400" />
                    Comment
                  </div>
                  {isEditing ? (
                    <textarea
                      name="agentDetails.comment"
                      value={taskData.agentDetails.comment || ""}
                      onChange={handleInputChange}
                      className={`${inputClass} min-h-[90px] resize-none`}
                    />
                  ) : (
                    <p className="rounded-xl bg-slate-50 p-3 text-sm font-medium text-slate-700">
                      {taskData.agentDetails.comment}
                    </p>
                  )}
                </div>
              </div>
            </section>


          

            {/* Deadlines */}
            <section className={sectionClass}>
              <h3 className={sectionTitleClass}>
                <FiClock className="text-indigo-500" />
                Deadlines
              </h3>
              <div className="space-y-3">
                <FieldRow icon={<FiCalendar className="text-indigo-400" />} label="Client">
                  {isEditing ? (
                    <input
                      type="datetime-local"
                      name="clientDeadline"
                      min={convertToLocalISOString(new Date())}
                      value={convertToLocalISOString(taskData.clientDeadline)}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  ) : (
                    FormateTime(taskData.clientDeadline)
                  )}
                </FieldRow>
                <FieldRow icon={<FiCalendar className="text-indigo-400" />} label="Tutor">
                  {isEditing ? (
                    <input
                      type="datetime-local"
                      name="tutorDeadline"
                      min={convertToLocalISOString(new Date())}
                      max={taskData.clientDeadline ? convertToLocalISOString(taskData.clientDeadline) : convertToLocalISOString(new Date())}
                      value={convertToLocalISOString(taskData.tutorDeadline)}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  ) : (
                    FormateTime(taskData.tutorDeadline)
                  )}
                </FieldRow>
              </div>
            </section>

            {/* Drive Link */}
            <section className={sectionClass}>
              <h3 className={sectionTitleClass}>
                <FiLink className="text-indigo-500" />
                Drive Link
              </h3>
              <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3">
                <a href={taskData.driveLink} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 break-all text-sm font-bold text-blue-500 underline">
                  {taskData.driveLink}
                </a>
                <button type="button" onClick={() => copyToClipboard(taskData.driveLink)} className="shrink-0 rounded-xl bg-white p-2 text-indigo-600 ring-1 ring-slate-200 hover:bg-indigo-50">
                  <FaRegCopy size={17} />
                </button>
              </div>
            </section>

            {/* Interested Tutors */}
            <section className={sectionClass}>
              <h3 className={sectionTitleClass}>
                <FiUsers className="text-indigo-500" />
                Interested Tutors
              </h3>
              <div className="space-y-2">
                {taskData.intrestedTutors && taskData.intrestedTutors.length > 0 ? (
                  taskData.intrestedTutors.map((tutor, index) => (
                    <div key={index} className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-bold text-slate-800">{tutor.name}</p>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => copyToClipboard(tutor.chatId)} className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-yellow-600 ring-1 ring-slate-200 hover:bg-yellow-50">
                          {tutor.chatId}
                        </button>
                        <button type="button" onClick={() => copyToClipboard(tutor.tutorID)} className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-emerald-600 ring-1 ring-slate-200 hover:bg-emerald-50">
                          {tutor.tutorID}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-sm italic text-slate-500">No tutors have shown interest yet.</span>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 sm:px-5">
          <div className="flex justify-end gap-3">
            {isEditing ? (
              <>
                <button type="button" onClick={() => setIsEditing(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="button" onClick={handleSave} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700">
                  Save
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => dispatch(setCloseTaskUpdateCard())} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                {taskData.status === "Cancel" && (deviceDetails.role === "admin" || deviceDetails.role === "owner") && (
                  <button type="button" onClick={toggleEdit} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700">
                    Edit
                  </button>
                )}
                {taskData.status !== "Cancel" && (
                  <button type="button" onClick={toggleEdit} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700">
                    Edit
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* University Popup (Local Search Modal) */}
        {showUniversityBox && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
              <button 
                type="button" 
                onClick={() => setShowUniversityBox(false)} 
                className="absolute right-4 top-4 rounded-md bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
              >
                Close
              </button>
              
              <h3 className="mb-4 text-base font-extrabold text-slate-900">Select University</h3>
              
              <div className="relative mb-3">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search university..."
                  value={uniSearchTerm}
                  onChange={(e) => setUniSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                  autoFocus
                />
              </div>

              <div className="max-h-[260px] overflow-y-auto rounded-lg border border-slate-100 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200">
                {filteredUniversities.length > 0 ? (
                  filteredUniversities.map((uni, idx) => (
                    <button
                      type="button"
                      key={idx}
                      value={uni}
                      onClick={(e) => {
                        handleInputChange(
                          { target: { name: "clientDetails.instituteName", value: uni } },
                          "clientDetails",
                          "instituteName"
                        );
                        setShowUniversityBox(false);
                      }}
                      className="block w-full border-b border-slate-100 px-4 py-3 text-left text-sm font-medium text-slate-700 transition last:border-b-0 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      {uni}
                    </button>
                  ))
                ) : (
                  <div className="py-6 text-center text-sm font-medium text-slate-500">
                    No universities found.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskUpdateCard;