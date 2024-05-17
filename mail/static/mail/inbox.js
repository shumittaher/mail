var mailBodyCompose;
var mailSubjectCompose;
var mailRecipientsCompose;
var emailsView;
var composeView;
var errorText;
var boxName;
var emailRowTable;

document.addEventListener('DOMContentLoaded', function() {

  //declaring query selectors
  mailBodyCompose = document.querySelector('#compose-body');
  mailSubjectCompose = document.querySelector('#compose-subject');
  mailRecipientsCompose = document.querySelector('#compose-recipients');
  emailsView = document.querySelector('#emails-view');
  composeView = document.querySelector('#compose-view');
  errorText = document.querySelector('#errorText')
  boxName = document.querySelector('#boxName')
  emailRowTable = document.querySelector('#emailRowTable')


  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

});

function compose_email() {

  // Show compose view and hide other views
  emailsView.style.display = 'none';
  composeView.style.display = 'block';

  // Clear out composition fields
  mailRecipientsCompose.value = '';
  mailSubjectCompose.value = '';
  mailBodyCompose.value = '';
 
}

function load_mailbox(mailbox) {

  
  // Show the mailbox and hide other views
  emailsView.style.display = 'block';
  composeView.style.display = 'none';

  
  // Show the mailbox name
  boxName.innerText = `${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}`

  //fetch query
  
  let url = `/emails/${mailbox}`;
  askFromApi(url);
  
}

function askFromApi(url) {
  
  fetch(url)
  .then(response => response.json())
  .then((emails)=>{
     
    if ("error" in emails ){
      populateError(emails.error)
      } else {
        populateEmails(emails);
      }
      
    })

}

function populateError(msg) {
  errorText.innerText = msg
}

function populateEmails(emails) {

  if (emails.length == 0) {
    populateError("No Emails Found")
  }
  
  emailRowTable.innerHTML=''

  emails.forEach(email => {
    
    row = makeEmailRowforBox(email)
    emailRowTable.innerHTML += row;

  });

}

function handle_email_submitted(event){
  event.preventDefault();

  emailItem = makeEmailObject(mailRecipientsCompose.value, mailSubjectCompose.value, mailBodyCompose.value)
  
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify(emailItem)
  })
  .then(response => response.json())
  .then(result => {
      console.log(result);
  });
}

function makeEmailObject(recipients, subject, body) {

  return {
    recipients: recipients,
    subject: subject,
    body: body
  }
  
}

function makeEmailRowforBox(emailObject) {

  let {archived, id, read, recipients, sender, subject, body, timestamp} = emailObject;

  const emailRow = `
  <tr onclick="openEmail(event)" class="email_row">
  <td></td>                    
  <td>${sender}</td>                    
  <td>${recipients}</td>                    
  <td>${subject}</td>                    
  <td>${timestamp}</td>                    
  </tr>
  `

  return emailRow
}

function openEmail(event) {

  console.log("email opened")
  
}