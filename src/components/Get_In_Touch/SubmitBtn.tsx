"use client";
import Spinner from "../Icons/Spinner";
import ShowMoreBtn from "../ShowMoreBtn/ShowMoreBtn";

interface SubmitProps {
  isLoading: boolean;
  isSuccess: boolean;
}

function SubmitBtn({ isLoading, isSuccess }: SubmitProps) {
  if(isLoading) {
    return (
      <ShowMoreBtn color="white" isLoading={true}>
        Loading
      </ShowMoreBtn>
    );
  }
  if(isSuccess) {
    return (
      <ShowMoreBtn color="white" isSuccess={true}>
        Main sent!
      </ShowMoreBtn>
    );
  }

  return (
    <ShowMoreBtn color="white">
      send message
    </ShowMoreBtn>
  );
}

export default SubmitBtn;
