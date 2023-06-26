"use client";
import { FormEvent, useRef, useState, RefObject } from "react";
import SubmitBtn from "./SubmitBtn";
import "./index.css";
import Warning from "../Icons/Warning";
import emailjs from "@emailjs/browser";

function GetInTouch() {
  const formRef = useRef<HTMLFormElement | undefined>();
  const emailRef = useRef<HTMLInputElement>();
  const fullNameRef = useRef<HTMLInputElement>();
  const messageRef = useRef<HTMLTextAreaElement>();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!formRef.current) {
        return setError("Please try again");
      }
      setIsLoading(true);

      const res = await emailjs.sendForm(
        process.env.NEXT_PUBLIC_GMAIL_ID as string,
        process.env.NEXT_PUBLIC_TEMPLATE_ID as string,
        e.target as any,
        process.env.NEXT_PUBLIC_PUBLICK_KEY as string
      );


      if(res.status === 200) {
        setIsSuccess(true);
        emailRef.current!.value = "";
        fullNameRef.current!.value = "";
        messageRef.current!.value = "";
      } else {
        throw new Error("Failed, please try again");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className="message-form"
      onSubmit={handleSubmit}
      ref={formRef as RefObject<HTMLFormElement>}
    >
      {error && (
        <h3 className="error-msg-fetch">
          <Warning /> {error}
        </h3>
      )}

      <label htmlFor="fullName">Name:</label>
      <input required type="text" id="fullName" name="fullName"
        ref={fullNameRef as any}
        />

      <label htmlFor="email">Email:</label>
      <input required type="email" id="email" name="email"
        ref={emailRef as any}
        />

      <label htmlFor="body">Message:</label>
      <textarea required id="message" name="message"
        ref={messageRef as any}
        ></textarea>

      <SubmitBtn isSuccess={isSuccess} isLoading={isLoading} />
    </form>
  );
}

export default GetInTouch;
