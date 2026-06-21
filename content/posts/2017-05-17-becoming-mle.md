---
layout: post
title: "Becoming a Self-Driving Car & Machine Learning Engineer"
date: 2017-05-17
categories: Career
---

# TLDR

About my 2016 sabbatical to pivot from semiconductor chip design into AI and deep learning. Learned a lot from MOOCs, built interesting projects, and got an MLE job in autonomous driving at BMW.

This was my first public blog post, [originally posted on Medium](https://medium.com/udacity/becoming-a-self-driving-car-machine-learning-engineer-4f9433e49c19). The contents of the blog post are reproduced below.

# Intro
The past year has been quite a journey for me. A year ago I left my full-time job in computer chip design, to go “back to school” for a career change into machine learning. However, I didn’t go back to school in a traditional sense — I decided to pursue online education via Udacity. After a year of online study plus two months of job searching, I landed a job at BMW’s Technology Office in Silicon Valley, working on machine learning applied to their self-driving car efforts.

For those considering a career change, possibly leaving their full-time job, maybe my story can serve as inspiration and provide some useful pointers. For those who are just curious, I think my story would at least be an interesting data point :)

![employee car program](/assets/img/2017-george-bmw.webp)
*One of the perks for working at BMW, the “employee car program”*

# My background
Prior to my career change, my professional background was in computer chip design. I completed my “traditional” education at the University of Michigan (Go Blue!), graduating with a BS in Computer Engineering and MS in Electrical Engineering back in 2009. After graduation, I found a job at AMD’s Boston office, working on various aspects of computer chip design and verification. The first few years were invigorating: I was learning industry best-practices, contributing to products that millions of people use, and I felt like I was making progress professionally.

# Time for a change?
However, around late-2014 I started feeling the semiconductor industry was stagnating, and I kept hearing news of consolidation within the industry. I wanted to be in an industry with high growth potential, so I knew I couldn’t stay put. Fortunately, during that time MOOCs were growing in popularity, so I took advantage and was learning about web development, Android development, machine learning, and artificial intelligence — all through online MOOCs. I felt ML/AI were the most interesting of those topics, and the growth potential seemed strong, so I decided to focus on that.

My goal in 2015 was to gain expertise in machine learning. After work and on weekends, I would study Andrew Ng’s machine learning class on Coursera, read posts on the /r/machinelearning sub-Reddit (mostly being totally confused), and read ML tutorials online (such as Andrej Karpathy’s blog posts; this was before CS231n was available). In November 2015, Udacity announced their Machine Learning Nanodegree (MLND), and I gladly signed up. Unfortunately, I felt my pace of progress was too slow while holding a full-time job, most likely due to my poor self-discipline. In the evenings after work, I often felt my brain was too tired, and I couldn’t push myself to do any brain-work such as studying. I mostly made progress on weekends.

Knowing how fast technology moves, I really wanted to be part of the AI revolution ASAP. The opportunity cost of staying put was too high. Financially, I had 2–3 years worth of living expenses in liquid savings, so it was feasible to quit my job and study full-time. I had briefly considered applying to a traditional university to get an MS in Computer Science. Having graduated during the Great Recession, I saw first-hand that a degree from a reputable university does not guarantee a job, so the cost vs. expected-value proposition was not attractive to me. During my time at university, I skipped a lot of lectures and barely went to any office hours, so I thought online education would suit me well. In 2015 I heard about a new program from Georgia Tech, called the OMSCS. From a financial cost perspective, this seemed like a great option (if I was accepted into the program, of course). However, Udacity had announced their MLND, which was an industry-focused education, and the timeframe to completion was significantly shorter than the OMSCS. Since the time and financial cost of the MLND was relatively small, and the education was industry-focused, I thought this was the right path for me. I planned to complete the MLND in 5–6 months, work on personal supplemental projects, and enter the ML/AI industry in Q4 2016.

With my master plan figured out in late-2015, and with buy-in from friends and family, I was ready to make the move and execute. In January 2016, I gave notice to my manager, and concluded my 6-year stint at AMD.

# Back to school
Of course, things don’t always go as planned. Here was the sequence of events that happened in 2016:

**Jan:** Leave job, relax for a few weeks
**Feb:** Work on MLND, and also Front-End Web Developer Nandodegree (FEND) since I was curious about web development
**Mar:** One month vacation in Thailand, spend time with parents
**Apr:** One week vacation in Japan (since it was a connecting flight to Boston), then finish up FEND
**May:** Finish MLND up until last project, wanted to do something “fancy” for my open-ended capstone. Starting viewing CS231n lectures on Youtube
**Jun-Jul:** Taking my sweet time viewing CS231n lectures, playing too much video games
**Aug:** Finished auditing CS231n on Youtube, decided I wanted to do my MLND capstone in deep reinforcement learning, inspired by AlphaGo earlier that year

In September 2016, something interesting happened: Udacity announced a new 9-month Nanodegree in self-driving cars. To me, the most interesting application of artificial intelligence is in robotics, and self-driving cars are a timely and incredibly useful application of that. I was already behind schedule in my master plan, but I thought this new Self-Driving Car Nanodegree (SDCND) would be worth the extra time investment. Since the first three months of the Nanodegree would be focused on deep learning and computer vision, I felt I could start applying for jobs in that area soon enough. With that, my 2016 timeline continued as follows:

**Sep:** Finished my MLND capstone project. Saw that SDCND was accepting applications, excitedly applied
**Oct:** Got accepted into SDCND’s October cohort! Started SCDND
**Nov-Dec:** Working on SDCND

# Preparing for job search
By mid-December 2016, I had completed the first 3 projects of the SDCND: basic lane detection, traffic sign classification, and behavioral cloning. Udacity gave me a great starting point for a portfolio, but I wanted to add something extra before I started applying for jobs. I always found object detection demos to be visually cool, so I decided to do a deep-learning-based object detection project (SDCND’s 5th project is actually vehicle detection, but it doesn’t use deep learning techniques). Ultimately, I spent 4 weeks creating a traffic sign detection project, implementing the popular “SSD” algorithm from scratch in TensorFlow.

Concurrently, I was also doing Udacity’s career enhancement projects, mainly updating my resume, LinkedIn profile, and GitHub profile. The Udacity reviewers provided valuable advice and encouragement throughout this process. For my resume and LinkedIn profile, my main struggle was to craft a concise yet compelling summary statement, as I was a non-standard applicant for sure. After much introspection plus great feedback from Udacity career services, here was the summary statement I used:

Changing careers into artificial intelligence with a focus on deep learning, with prior industry experience in microprocessor design and verification at AMD. Proven ability to successfully execute on large-scale computer engineering projects affecting millions of users worldwide.

Currently enrolled in Udacity’s Self-Driving Car Engineer Nanodegree, part of the inaugural cohort that started in October 2016. Also working as a mentor for other students in the Nanodegree.

Another great opportunity came when fellow SDCND student Patrick Poon created the Boston Self Driving Cars Meetup group. The meetup was initially focused on Udacity’s SDCND. As I was part of the first SDCND cohort, I volunteered to share my experiences via an informal talk, which I gave in mid-December. Patrick suggested we record the talk and upload it to Youtube, which was a great idea as it helped bolster my online presence, as well as the meetup group’s. Over the following months, a couple professional opportunities opened up for me through the meetup.

# Job searching
## Applications
By late-January 2017, I was ready to apply for jobs. I focused mainly on deep learning and computer vision jobs, with a preference for jobs related to autonomous vehicles. I also applied to jobs in AI chip design (did not get any interviews for these) and general machine learning. The application channels I used were LinkedIn Jobs, AngelList, applying directly on companies’ websites, a local 3rd party recruiter in Boston, and Udacity’s career services. In total I actively applied to about 90 jobs.

## Interview questions
Generally, I interviewed for two types of roles: (1) machine learning & computer vision engineer, and (2) software engineer to implement algorithms from machine learning researchers.

For (1), the interview questions focused on machine learning (esp. deep learning) concepts, how ML/DL applies to computer vision, and “traditional” computer vision concepts (perspective transform, edge detection, line detection, etc.). Also, there were lots of questions about finding lane lines, and figuring out how to improve lane detection algorithms. Much of the interview was also spent on discussing my past projects in deep learning and computer vision — my motivations, the process I went through, how I could improve upon the projects. One particular question that came up repeatedly was “how did you go beyond the coursework requirements?”, or similarly “which of your projects were not part of your coursework?”. An important trait is to be genuinely curious about the topic, such that you go above & beyond the project requirements and/or create your own interesting project(s).

For (2), the interviewer would gauge my general interest in machine learning, then ask coding questions like those found in Cracking the Coding Interview or LeetCode. Statistically, I did not do well in these interviews, as I had only started grinding CTCI/LeetCode a few weeks prior.

## Interviews & offers — the numbers
In the end (mid-March) I had 9 interviews out of my ~90 job applications, i.e. around 10% of applications lead to interviews. In my mind this was a pretty good conversion rate. Out of those 9 interviews, 4 of them lead to final-round interviews: 2 final-round interviews for full-time jobs, 2 final-round interviews for internships. I did well on those 4 interviews as they all lead to offers. At the end of my two-month job search, I had 2 full-time offers and 1 internship offer for self-driving car perception roles, plus 1 internship offer for a natural language understanding role (applying NLU/AI to understand medical records). Ultimately, I decided to accept the full-time offer from BMW.

# BMW
## Application
Let me rewind and describe the application and interview process with BMW. In early February, Udacity announced that BMW was hiring for various positions, and they were interested in candidates from the SDCND program. I looked through the open positions, and was particularly interested in their Software Developer, Machine Learning position. This position focused on machine learning applied to BMW’s autonomous driving efforts, involving technology scouting & evaluation, prototyping, and technology transfer into production. This sounded like the perfect blend of research and engineering. Also, it would be really cool to work on self-driving Bimmers! I excitedly applied for this job.

## Interviews
A week or two later, I heard back from BMW that they wanted to interview me. Overall, my interview process was an initial phone interview, followed by an on-site interview. Both interviews involved technical questions about machine learning and computer vision, and its applications to autonomous vehicles. For my on-site interview, I was asked to give a talk and Q&A about data and machine learning, the specific topic of which was sent to me beforehand. I thought the topic was very interesting, and I had fun preparing and giving the talk plus Q&A. Of course, both interviews gave me opportunities to ask questions and better understand the role and the team.

## Offer
My on-site at BMW was a positive experience. The team I would work with seemed great, and the role was super interesting and had great potential. By this time I already had a couple other SDC offers, so I was eager to hear back from BMW since they were my top choice. After a week of constantly checking my email/phone every few minutes, I received an email from BMW HR saying they would like to extend me an offer! We scheduled a phone call to discuss further, and agreed on the details. Time to get ready to move across the country and start a new career :)

## Today
It’s been a little over three weeks since I started my job at BMW, and things are looking good. I am surrounded by incredible people and amazing technology. There is so much to learn, and so much room to innovate. I am really excited about the coming months!

# Final thoughts
A year ago I took the plunge into the unknown, leaving my full-time job in computer chip design to study machine learning via Udacity. Some may have thought this was a strange decision, but I was confident (maybe naively) that I made the right choice, and things would work out well. Fast forward to now, I have successfully changed careers into machine learning — machine learning applied to self-driving BMWs. For someone in a similar position as me, I hope my story gave you some valuable information and inspiration. For everyone, I hope my story was an interesting data point to add to your knowledge base. Thanks for reading!
