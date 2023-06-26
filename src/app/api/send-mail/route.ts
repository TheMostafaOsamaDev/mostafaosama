import { NextResponse } from "next/server";
// @ts-ignore
import nodemailer from "nodemailer";

// Create Transport
const transport = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

export async function POST(req: Request) {
  const { body, email } = await req.json();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!body || !email) {
    return NextResponse.json(
      { message: "All input must be full." },
      {
        status: 403,
      }
    );
  } else if (!emailRegex.test(email)) {
    return NextResponse.json(
      { message: "Email shape is wrong." },
      {
        status: 400,
      }
    );
  }
  console.log(emailRegex.test(email));

  try {
    transport.sendMail({
      to: process.env.EMAIL,
      from: process.env.EMAIL,
      subject: `message from: ${email}`,
      title: `${email}: ${body.length > 10 ? body.slice(0, 10) + "..." : body}`,
      html: `
        <h3>Sender: ${email}</h3>
        <p>${body}</p>
      `,
    });
  } catch (err) {
    return NextResponse.json(
      {
        message: "Try again later",
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "DONE",
  });
}
