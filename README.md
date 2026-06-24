<img width="1545" height="753" alt="image" src="https://github.com/user-attachments/assets/8cc3e81e-1030-40ec-b12c-8d32a5e9bb5f" /># AfterMeeting-GraduationProject
After Meeting - Graduation Project 2026
The full source code and documentation will be uploaded here shortly.



Markdown
## 🚀 Getting Started (دليل التشغيل)

To get a local copy of the "After Meeting" project up and running, you need to set up the three main components: Backend (.NET), Frontend, and the AI Speech Processing Service.

### 📋 Prerequisites (المتطلبات الأساسية)
Please make sure you have the following installed on your machine:
* **Backend:** [.NET SDK](https://dotnet.microsoft.com/download) (8.0 or your current version), [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) & SSMS.
* **Frontend:** [Node.js](https://nodejs.org/) and npm (or yarn).
* **AI Service:** [Python 3.x](https://www.python.org/downloads/) and [FFmpeg](https://ffmpeg.org/download.html) (Required for audio processing/Whisper).
* **Version Control:** [Git](https://git-scm.com/).

---

### 🛠️ 1. Clone the Repository
First, clone the project to your local machine:
sh
git clone [https://github.com/Abdalrahmankesba/AfterMeeting-GraduationProject.git](https://github.com/Abdalrahmankesba/AfterMeeting-GraduationProject.git)
cd AfterMeeting-GraduationProject
⚙️ 2. Backend Setup (.NET Core & SQL Server)
Navigate to the backend folder (Update the folder name if different):

Bash
   cd Backend
Database Configuration:

Open appsettings.json or appsettings.Development.json.

Update the DefaultConnection string to match your local SQL Server instance.

Example: "Server=YOUR_SERVER_NAME;Database=AfterMeetingDB;Trusted_Connection=True;TrustServerCertificate=True;"

Apply Database Migrations:

Bash
   dotnet ef database update
Run the Application:

Bash
   dotnet run
The API will start running on https://localhost:5001 or http://localhost:5000.

🧠 3. AI Service Setup (Whisper & Audio Processing)
Open a new terminal and navigate to the AI service folder (Update the folder name if different):

Bash
   cd AI_Service
Create a Virtual Environment (Optional but recommended):

Bash
   python -m venv venv
Activate the Virtual Environment:

On Windows: .\venv\Scripts\activate

On Mac/Linux: source venv/bin/activate

Install AI Dependencies:
Make sure you have FFmpeg installed on your system, then run:

Bash
   pip install -r requirements.txt
Run the AI Server:

Bash
   python app.py
The AI service should now be listening for audio processing requests.

💻 4. Frontend Setup (User Interface)
Open a new terminal and navigate to the frontend folder:

Bash
   cd FrontEnd
Install Dependencies:

Bash
   npm install
Configure Environment Variables:

Copy the .env.example file and rename it to .env (if applicable).

Update the API Base URLs inside the .env file to point to your local .NET Backend and AI Service.

Run the Frontend Application:

Bash
   npm start
   # or
   npm run dev
The application will open in your browser at http://localhost:3000.
