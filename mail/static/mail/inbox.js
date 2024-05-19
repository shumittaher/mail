var mailBodyCompose;
var mailSubjectCompose;
var mailRecipientsCompose;
var emailsView;
var composeView;
var errorText;
var boxName;
var emailRowTable;
var emailTable;
var openEmailView;
var emailContent;
var archiveButton

var lastBoxLoaded;


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
  emailTable = document.querySelector('#emailTable')
  openEmailView = document.querySelector('#openEmailView')
  emailContent = document.querySelector('#emailContent')
  archiveButton = document.querySelector('#archiveButton')


  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

});

function compose_email(event, emailObject) {

  // Show compose view and hide other views
  emailsView.style.display = 'none';
  composeView.style.display = 'block';

  // Clear out composition fields
  mailRecipientsCompose.value = '';
  mailSubjectCompose.value = '';
  mailBodyCompose.value = '';

  if (emailObject){

    let {archived, id, read, recipients, sender, subject, body, timestamp} = emailObject;

    mailRecipientsCompose.value = sender;
    mailSubjectCompose.value = 'Re: ' + subject;

  };
 
}

function load_mailbox(mailbox) {

  lastBoxLoaded = mailbox;

  if (mailbox === "archive"){
    archiveButton.innerText = "un-Archive";
    archiveButton.setAttribute("data-archive-instruction", false)

  } else {
    archiveButton.innerText = "Archive";
    archiveButton.setAttribute("data-archive-instruction", true)

  }

  // Show the mailbox and hide other views
  emailsView.style.display = 'block';
  composeView.style.display = 'none';
  emailTable.style.display = 'block';
  openEmailView.style.display = 'none';


  
  // Show the mailbox name
  boxName.innerText = `${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}`

  //fetch query
  
  let url = `/emails/${mailbox}`;
  getFromApi(url, populateEmails, populateError);
  
}

function getFromApi(url, successFunction, failureFunction) {

  fetch(url)
  .then(response => response.json())
  .then((data)=>{
     
    if ("error" in data ){
        failureFunction(data.error)
      } else {
        successFunction(data);
      }
      
    })

}

function populateError(msg) {
  errorText.innerText = msg;
}

function populateEmails(emails) {

  if (emails.length == 0) {
    populateError("No Emails Found")
    emailTable.style.display = 'none';
  } else {
    populateError("")
  }
  
  emailRowTable.innerHTML='';

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
    if ("error" in result){
      showAlert(result.error);
    } else {
      showAlert(result.message);
      load_mailbox('inbox');
    }
  });
}

function showAlert(message) {
  alert(message)
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

  if (read){
    var background_color = "lightgray";
    var color = "black";
  } else {
    var background_color = "white";
    var color = "black";
  }

  const emailRow = `
  <tr onclick="openEmail(event)" class="email_row" data-id = ${id} style="background-color: ${background_color}; color: ${color};">
  <td></td>                    
  <td>${sender}</td>                    
  <td>${recipients}</td>                    
  <td>${subject}</td>                    
  <td>${timestamp}</td>                    
  </tr>
  `
  return emailRow;
}

function openEmail(event) {
  
  const emailId = event.target.parentNode.dataset.id;
  const url = `emails/${emailId}`;

  getFromApi(url, showEmail, populateError);
}

function showEmail(emailObject) {

  let {archived, id, read, recipients, sender, subject, body, timestamp} = emailObject;
  let emailObjectJason = JSON.stringify(emailObject)
  localStorage.setItem('currentEmail', emailObjectJason)
  
  composeView.style.display = 'none';
  emailTable.style.display = 'none';
  openEmailView.style.display = 'block';

  putRequest(id,{read:true})
  
  const emailBody = `
  <div class="my-4">
  <h6>From: ${sender}</h6>
  <h6>To: ${recipients}</h6>
  <h6 class="mb-4">Time Stamp: ${timestamp}</h6>
  <h6>Subject: ${subject}</h6>
  </div>
  <p>${body}</p>
  `
  emailContent.innerHTML = emailBody;
  openEmailView.setAttribute("data-emailId", `${id}`)
}

function handleBackButton(event) {
  
  load_mailbox(lastBoxLoaded);

}

function putRequest(emailId, actionObject){

  fetch(`/emails/${emailId}`, {
    method: 'PUT',
    body: JSON.stringify(actionObject)
  })

}

function handleArchiveButton(event) {

  const emailID = event.target.parentNode.dataset["emailid"];
  const archiveInstruction = event.target.dataset["archiveInstruction"] === 'true'

  putRequest(emailID, {archived:archiveInstruction});

  load_mailbox("inbox");
}

function handleReply(event) {

  const emailObject = JSON.parse(localStorage.getItem("currentEmail"));
  
  compose_email(event,emailObject); 
}