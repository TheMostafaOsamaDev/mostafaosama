"use client";
import { FormEvent, useRef, useState, RefObject } from "react";
import SubmitBtn from "./SubmitBtn";
import "./index.css";
import Warning from "../Icons/Warning";

function GetInTouch() {
  const emailRef = useRef<HTMLInputElement|undefined>();
  const bodyRef = useRef<HTMLTextAreaElement|undefined>();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async ( e:FormEvent<HTMLFormElement> ) => {
    e.preventDefault();

    try {
      const email = emailRef.current?.value;
      const body = bodyRef.current?.value;

      const data = {
        email,
        body
      }
      
      setIsLoading(true);
      const res = await fetch("/api/send-mail", {
        method: "post",
        body: JSON.stringify(data)
      });

      if(res.status === 200) {
        emailRef.current!.value = "";
        bodyRef.current!.value = "";
        setIsSuccess(true);
      } 
      else if(res.status === 403) {
        throw new Error("Please fill all fields!");
      } else if(res.status === 400) {
        throw new Error("Email shape is wrong!");
      } else {
        throw new Error("Some error occured!");
      }
    } catch(err : any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className='message-form' onSubmit={handleSubmit}>
      {error && <h3 className="error-msg-fetch"><Warning /> {error}</h3>}
      
      <label htmlFor="email">Email:</label>
      <input ref={emailRef as RefObject<HTMLInputElement>}
      required type='email' id='email' />

      <label htmlFor="body">Message:</label>
      <textarea ref={bodyRef as RefObject<HTMLTextAreaElement>}
      required id='body'></textarea>

      <SubmitBtn isSuccess={isSuccess} isLoading={isLoading} />
    </form>
  )
}

export default GetInTouch
