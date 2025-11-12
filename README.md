### WORKFLOWBAN

A Trello-esque project management Website featuring a role-based permission system.


### Features

Create project goals and sub-tasks for each goal. Each sub task is given a name, status, whose is working on it, and an accompanying attachment, if needed. 
These sub tasks can be moved around different goals depending on client needs.

Admins, such as faculty admins or Company managers, are able to modify and create permissions for either roles or specific people. 

These permissions include
- Ability to view certain goals or tasks
- Creation of tasks
- Modification, such as attachment upload, status or date change, and deletion.


### Tools used

This project was built using React and accompanying packages for our frontend, and an Express-based server with middleware such as multer(file uploading) and passport to handle non-local authentication.

A MySql database on a remote ubuntu server, provided by Professor John Wiegley, handled database interactions, and an AWS S3 instance to handle attached file uploading, viewing, and deletion.

Group Members:

Sebastian Sunga
Bryan Abrego
Alyssa Gomez 
John Dong
Bianca Loera
