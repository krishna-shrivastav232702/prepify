import { useState } from "react";
import axios from "axios";

interface FileData{
    userId:string;
    originalName:string;
    s3Key:string;
    contentType:string;
    fileSize:number;
}



interface PresignedUrlResponse{
    url:string;
    UploadedFile:FileData
}


const FileUpload:React.FC = ()=>{
    const [file,setFile] = useState<File | null>(null);
    const [chapter,setChapter]=useState<string>("");
    const [extractedText,setExtractedText]=useState<string>("");

    const handleFileChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
        if(e.target.files){
            setFile(e.target.files[0]);
        }
    };

    const handleChapterChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
        setChapter(e.target.value);
    }

    const handleUploadClick = async () =>{
        if(!file){
            alert("Please select a file to upload");
            return;
        }
        try {
        const filename = file.name;
        const contentType = file.type;
        const fileSizeInKb = file.size /1024;
        const fileSizeInMb = fileSizeInKb / 1024;
        const userId = "cm5rre9bt0000klf09fb28ujc"; // here user id will be the id that is getting generated by cuid();

        
            const response = await axios.post<PresignedUrlResponse>('http://localhost:7008/pdf/getPresignedUrl',{filename:filename,contentType:contentType,fileSize:fileSizeInMb,userId:userId});
            const {url,UploadedFile} = response.data;
            await uploadFileToS3(file,url);
            await extractTextFromFile(UploadedFile);
        } catch (error) {
            console.error("Error Fetching Presigned Url",error);
        }
    };

    const uploadFileToS3 = async(file:File,url:string)=>{
        const formData = new FormData();
        formData.append("file",file);
        try {
            await axios.put(url,formData,{
                headers:{
                    "Content-Type":file.type,
                }
            });
            alert("file Uploaded Successfully");
        } catch (error) {
            console.log("Error uploading file to s3",error);
            alert("Error uploading file");
        }
    }

    const extractTextFromFile = async(UploadedFile:FileData)=>{
        const {s3Key} = UploadedFile;
    try {
        const signedUrlResponse = await axios.post('http://localhost:7008/pdf/getSignedUrlForGetObj',{s3Key});
        const signedUrl = signedUrlResponse.data.url;
        const extractionResponse = await axios.post('http://localhost:5000/extract-text',{
            pdf_url:signedUrl,
            section_type:"Chapter",
            section_number:chapter  //it should be Ten not 10
        });
        const text = extractionResponse.data.section_text;
        setExtractedText(text);
        await sendingTextToGemini(text);
    } catch (error) {
        console.error("error extracting text:",error);
        throw new Error("Failed to extract text from PDF");        
    }
    }

    const sendingTextToGemini = async(text:string)=>{
        try {
            const response = await axios.post('http://localhost:7008/pdf/gemini',{text});
            console.log(response.data.result.response.candidates[0].content.parts[0].text);
        } catch (error) {
            console.error("error from the gemini model");
        }
    }


    return(
        <div className="p-4 max-w-2xl mx-auto">
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">
                    Upload PDF
                </label>
                <input 
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="w-full border rounded p-2"
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium mb-2">
                    Chapter Number
                </label>
                <input 
                    type="text"
                    value={chapter}
                    onChange={handleChapterChange}
                    placeholder="Enter chapter number (e.g., 10)"
                    className="w-full border rounded p-2"
                />
            </div>

            <button 
                onClick={handleUploadClick}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
             Upload and Extract
            </button>

           

            {extractedText && (
                <div className="mt-4">
                    <h3 className="font-medium mb-2">Extracted Text:</h3>
                    <div className="border p-4 rounded bg-gray-50">
                        {extractedText}
                    </div>
                </div>
            )}
        </div>
    </div>
    )
}

export default FileUpload