"use client";
import { useAuthPriest } from '@/hooks/useAuthPriest'
import { apiPut } from '@/services/axios';
import React, { useState } from 'react'
import { toast } from 'sonner';

const PriestProfilePage = () => {
  const { loggedInPriest } = useAuthPriest();
  const [editPriestForm, setEditPriestForm] = useState({
    priest_name: loggedInPriest?.priest_name ?? "", 
  });

  const handleEditPriestFormChange = (key, value) => {
    if(!key) return;
    if(Object.keys(editPriestForm).includes(key)) {
      setEditPriestForm(prev => ({...prev, [key]: value}));
    }
  }

  const handleEditPriestProfileUpdate = async () => {
    try {
      if(!loggedInPriest) return;
      //validateEditPriestpayload();
      const res = await apiPut(`/priest/${loggedInPriest?._id}`, editPriestForm);
      if(res?.status === "success") {
        toast.success("Your profile got updated successfully");
        return;
      }
    } catch(err) {
      toast.error(err?.message);
    }
  }
  

  return (
    <div>
      <div>
        <label>Priest name</label>
        <input type='text' value={editPriestForm.priest_name} onChange={(e) => handleEditPriestFormChange("priest_name", e.target.value)} />

      </div>

      <span>More Fields like you profile image, age , etc... will come sooon so  don't you worry</span>

    <button onClick={handleEditPriestProfileUpdate}>Update</button>

    </div>
  )
}

export default PriestProfilePage;