// This is to be determined but I want a custom object type we can use to 
// represent tasks within the database/whole system

/* 
   The attributes should be:

   Name/identifer of the task created.
   String textfield from the textarea, this would be like "Meeting for unit waiver"
   Date: this would be important to determine where it should be ordered in the actually taskboard.
   Start/end time: same as date, but more specialized in the column
   Files: a list/array of attached files, 


*/


class Task {
      constructor(person,date,text,attachments, column){
         this.person = person;
         this.date = date;
         this.text = text;
         this.attachments = attachments;
         this.status = 1; // 1, as task was just created, 2 should designate as completed, and 0 as overdue
         this.column = column
      }
      
  //Generic setter methods, probably useful for the dashboard so users can edit the tasks.
   async editDate(newDate){
      this.date = newDate;
   }


   async setToCompleted() {
      this.status = 2;
   }

   async setToOverdue(){
      this.status = 0;
   }

   async editPerson(newPerson){
      this.person = this.person;
   }

   async editText(newText){
      this.text = newText;
   }
}

module.exports = Task;