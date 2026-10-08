export const site = {
  name: "Mostafa Osama",
  role: "Full stack developer",
  employer: { name: "Onvaca", url: "https://www.onvaca.com" },
  location: "Cairo, Egypt",
  email: "mostafa.osama.dev@gmail.com",
  // TODO(mostafa): switch to the custom domain once it exists.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://mostafa-osama-official.vercel.app",
  description:
    "Full stack developer at Onvaca with a backend lean: payments, reservations and pricing in Node.js, GraphQL, MySQL and AWS. Projects, writing and experiments.",
  links: {
    github: "https://github.com/TheMostafaOsamaDev",
    linkedin: "https://www.linkedin.com/in/mostafa-osama-a5b042239/",
    cv: "/mostafa-osama-cv.pdf",
  },
} as const;
