import axiosInstance from "@/utils/axios";
import { toast } from "sonner";

 export const handleSendEmail = async (id: string,baseurl:string,subject:string,message:string,cc:string,email:string) => {
    console.log(id)
    const token = localStorage.getItem("token");
    console.log("handleSendEmail", id);

    try {
      const res = await axiosInstance.post(
        `/api/v1/email/${baseurl}`,
        { id ,subject,message,cc,email},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

     
          if(res.data.success){
            toast.success(res.data.message)
          }else{
            toast.error(res.data.message)
          }
    } catch (err) {
      console.error(err);
      toast.error("Failed to send quotation email");
    }
  };