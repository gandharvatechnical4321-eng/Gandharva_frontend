import React, { useState } from 'react';
import Select from 'react-select';
import options from './skillsData.js'
import { GiTakeMyMoney } from "react-icons/gi";
import { CiCircleRemove } from "react-icons/ci";
import { FaPencilAlt } from "react-icons/fa";
import clgOptions from './clgData.js';
import axios from 'axios';
const EditTutor = ({setReload, tutorData,setEditTutor}) => {
    // console.log({tutorData})
    const levelValue =(arr)=>{
       return arr.map(e=>{return {label:e,value:e}})
    }
  const [buttonClicked,setButtonClicked]=useState(false)
  const [formData, setFormData] = useState({
    
    
    whatsappNo: tutorData.whatsappNo,
    phoneNumber: tutorData.phoneNumber,  
    expertSkills: levelValue(tutorData.expertSkills),
    intermediateSkills:levelValue(tutorData.intermediateSkills),
    beginnerSkills: levelValue(tutorData.beginnerSkills), 
     
    isLateNightCallOk: tutorData.isLateNightCallOk,
    previousAssignmentLinks: tutorData.previousAssignmentLinks  , // Now an array
    newLink: "", // For temporary input of new links
    paymentDetails:{ 
      bankHolderName:tutorData.paymentDetails.bankHolderName,
      AccoutNumber:tutorData.paymentDetails.AccoutNumber,
      IFSC:tutorData.paymentDetails.IFSC,
      upiHolderName:tutorData.paymentDetails.upiHolderName,
      upiID:tutorData.paymentDetails.upiID
    }, 
  });

  // Sample data for skills and colleges
  const skillOptions = options;

  const collegeOptions = clgOptions;

  const degreeOptions = [
    { label: '3rd Year BTech', value: '3rd Year BTech' },
    { label: '4th Year BTech', value: '4th Year BTech' },
   
    { label: '1st Year MTech', value: '1st Year MTech' },
    { label: '2nd Year MTech', value: '2nd Year MTech' },
    { label: 'MBA', value: 'MBA' },
    { label: 'BSC', value: 'BSC' },
    { label: 'MSC', value: 'MSC' },
    { label: 'BBA', value: 'BBA' },
    { label: 'MCA', value: 'MCA' },
    { label: 'PHD', value: 'PHD' },
    { label: 'other', value: 'other' },
    
  ];

  const departmentOption = [
    { label: 'production', value: 'production' },
    { label: 'chemical', value: 'chemical' }, 
    { label: 'other', value: 'other' },
    
  ];
  const experience=[
    {label:'freshers',value:'freshers'},
      {label:'0.5 yr',value:'0.5 yr'},
      {label:'1 yr',value:'1 yr'},
      {label:'1.5 yr',value:'1.5 yr'},
      {label:'2 yr',value:'2 yr'},
      {label:'2.5 yr',value:'2.5 yr'},
      {label:'3 yr',value:'3 yr'},
      {label:'more than 3',value:'more than 3'},
  ]


  const addLink = () => {
    if (formData.newLink.trim()) {
      setFormData({
        ...formData,
        previousAssignmentLinks: [
          ...formData.previousAssignmentLinks,
          formData.newLink,
        ],
        newLink: "",
      });
    }
  };

  const removeLink = (index) => {
    const updatedLinks = formData.previousAssignmentLinks.filter(
      (_, i) => i !== index
    );
    setFormData({ ...formData, previousAssignmentLinks: updatedLinks });
  };
 
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSelectexpertSkills = (selectedSkill) => {
    if(formData.expertSkills.length===6){alert("Select Only top 4...");return;}
    if (selectedSkill) {
      setFormData({
        ...formData,
        expertSkills: [...formData.expertSkills, selectedSkill]
      });
    }
  };
  const handleSelectintermediateSkills = (selectedSkill) => {
    if(formData.intermediateSkills.length===4){alert("Select Only top 4...");return;}

    if (selectedSkill) {
      setFormData({
        ...formData,
        intermediateSkills: [...formData.intermediateSkills, selectedSkill]
      });
    }
  };
  const handleSelectbeginnerSkills = (selectedSkill) => {
    if(formData.beginnerSkills.length===3){alert("Select Only top 3...");return;}

    if (selectedSkill) {
      setFormData({
        ...formData,
        beginnerSkills: [...formData.beginnerSkills, selectedSkill]
      });
    }
  };

   

  const handleSelectDegree = (selectedDegree) => {
    setFormData({
      ...formData,
      highestDegree: selectedDegree ? selectedDegree.value : ''
    });
  };
  const handleSelectExperience = (selectedExperience) => {
    setFormData({
      ...formData,
      experience: selectedExperience ? selectedExperience.value : ''
    });
  };

  // const handleSelectDepartment = (selectedDepartment) => {
  //   setFormData({
  //     ...formData,
  //     department: selectedDepartment ? selectedDepartment.value : ''
  //   });
  // };


 // Function to filter options dynamically
const getFilteredOptions = () => {
  const selectedSkills = [
    ...formData.expertSkills,
    ...formData.intermediateSkills,
    ...formData.beginnerSkills,
  ];
  return skillOptions.filter(
    (option) =>
      !selectedSkills.some((selectedSkill) => selectedSkill.value === option.value)
  );
};
  const handleSubmit = async(e) => {
    e.preventDefault();
    if(formData.phoneNumber[0]!=='+' || formData.whatsappNo[0]!=='+'){alert("Please Provide '+91' in phone no & whatsapp no or your country code...");return;}
    if(formData.phoneNumber.length<=11 || formData.whatsappNo.length<=11){alert("Please Check you phone/whatsapp number...");return;}
    setButtonClicked(true)
    const formDataToSend =   { 
     whatsappNo: formData.whatsappNo,
     phoneNumber: formData.phoneNumber,   
     expertSkills: formData.expertSkills.map(e=>e.value),
     intermediateSkills: formData.intermediateSkills.map(e=>e.value),
     beginnerSkills: formData.beginnerSkills.map(e=>e.value), 
     isLateNightCallOk: formData.isLateNightCallOk, 
     paymentDetails:  formData.paymentDetails,     
     }
     console.log(formDataToSend)
    try {
      const response = await axios.put(
        `https://tutorform-backend.vercel.app/edit/${tutorData._id}`,
        formDataToSend ,
        {
            headers: {
              'Content-Type': 'application/json',
            },
          }
      );
      console.log('Form Edited successfully:', response.data);

      if(response.data){
        setReload(e=>e+1);
        console.log("edited");
        setButtonClicked(false);
        setEditTutor(false)
      }
      else{
        alert("Something is wrong please inform developer...");
        setButtonClicked(false);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setButtonClicked(false);
      alert('Error submitting form.');
    }
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      paymentDetails: {
        ...prev.paymentDetails,
        [name]: value,
      },
    }));
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2.5 backdrop-blur-sm sm:p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 px-3 py-3 text-white sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <FaPencilAlt size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold sm:text-lg">Edit Tutor Details</h3>
              <p className="text-[11px] text-indigo-100">Update the required values carefully.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setEditTutor(false)}
            className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-white/20"
          >
            Close
          </button>
        </div>

        <div className="max-h-[calc(90vh-90px)] overflow-y-auto bg-slate-50 p-3 sm:p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 text-[11px] font-bold text-indigo-600">
                  1
                </div>
                <h4 className="text-sm font-bold text-slate-800">Contact Information</h4>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                  <label htmlFor="whatsappNo" className="mb-1.5 block text-xs font-semibold text-slate-700">WhatsApp No</label>
                  <input
                    type="text"
                    id="whatsappNo"
                    name="whatsappNo"
                    value={formData.whatsappNo}
                    onChange={handleChange}
                    placeholder="+1 (555) 555-5555"
                    className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    required
                  />
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                  <label htmlFor="phoneNumber" className="mb-1.5 block text-xs font-semibold text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+1 (555) 555-5555"
                    className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-100 text-[11px] font-bold text-violet-600">
                  2
                </div>
                <h4 className="text-sm font-bold text-slate-800">Skill Set</h4>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">4 Expert Skills (Best 4)</label>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {formData.expertSkills.map((skill, index) => (
                      <div key={index} className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                        <span>{skill.label}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newSkills = formData.expertSkills.filter((_, i) => i !== index);
                            setFormData({ ...formData, expertSkills: newSkills });
                          }}
                          className="text-indigo-500 transition hover:text-red-500"
                          aria-label={`Remove ${skill.label}`}
                        >
                          <CiCircleRemove className="font-bold" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {formData.expertSkills.length < 6 && (
                    <Select
                      options={getFilteredOptions()}
                      onChange={handleSelectexpertSkills}
                      className="text-sm text-slate-700"
                      placeholder="Select a skill"
                    />
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">4 Intermediate Skills</label>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {formData.intermediateSkills.map((skill, index) => (
                      <div key={index} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                        <span>{skill.label}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newSkills = formData.intermediateSkills.filter((_, i) => i !== index);
                            setFormData({ ...formData, intermediateSkills: newSkills });
                          }}
                          className="text-amber-600 transition hover:text-red-500"
                          aria-label={`Remove ${skill.label}`}
                        >
                          <CiCircleRemove className="font-bold" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {formData.intermediateSkills.length < 4 && (
                    <Select
                      options={getFilteredOptions()}
                      onChange={handleSelectintermediateSkills}
                      className="text-sm text-slate-700"
                      placeholder="Select a skill"
                    />
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">3 Beginner Skills</label>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {formData.beginnerSkills.map((skill, index) => (
                      <div key={index} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        <span>{skill.label}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newSkills = formData.beginnerSkills.filter((_, i) => i !== index);
                            setFormData({ ...formData, beginnerSkills: newSkills });
                          }}
                          className="text-slate-500 transition hover:text-red-500"
                          aria-label={`Remove ${skill.label}`}
                        >
                          <CiCircleRemove className="font-bold" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {formData.beginnerSkills.length < 3 && (
                    <Select
                      options={getFilteredOptions()}
                      onChange={handleSelectbeginnerSkills}
                      className="text-sm text-slate-700"
                      placeholder="Select a skill"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Late-night call availability</p>
                  <p className="text-[11px] text-slate-500">For urgent tasks only</p>
                </div>

                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    id="isLateNightCallOk"
                    name="isLateNightCallOk"
                    checked={formData.isLateNightCallOk}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Yes
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-[11px] font-bold text-emerald-600">
                  3
                </div>
                <h4 className="text-sm font-bold text-slate-800">Payment Details</h4>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">UPI Holder Name</label>
                  <input
                    type="text"
                    name="upiHolderName"
                    placeholder="UPI holder name"
                    value={formData.paymentDetails.upiHolderName}
                    onChange={handlePaymentChange}
                    className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    required
                  />
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">UPI ID</label>
                  <input
                    type="text"
                    name="upiID"
                    placeholder="UPI ID"
                    value={formData.paymentDetails.upiID}
                    onChange={handlePaymentChange}
                    className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    required
                  />
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Bank Holder Name</label>
                  <input
                    type="text"
                    name="bankHolderName"
                    placeholder="Bank holder name"
                    value={formData.paymentDetails.bankHolderName}
                    onChange={handlePaymentChange}
                    className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    required
                  />
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Account Number</label>
                  <input
                    type="text"
                    name="AccoutNumber"
                    placeholder="Account number"
                    value={formData.paymentDetails.AccoutNumber}
                    onChange={handlePaymentChange}
                    className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    required
                  />
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 md:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">IFSC Code</label>
                  <input
                    type="text"
                    name="IFSC"
                    placeholder="IFSC code"
                    value={formData.paymentDetails.IFSC}
                    onChange={handlePaymentChange}
                    className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 border-t border-slate-200 pt-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setEditTutor(false)}
                className="order-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:order-1"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={buttonClicked}
                className="order-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:from-indigo-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-70 sm:order-2"
              >
                {buttonClicked ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTutor;
