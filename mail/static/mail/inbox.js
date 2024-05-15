var mailBody;

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');


  //declaring query selectors
  mailBody = document.querySelector('#compose-body')

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  mailBody.value = '';
}

function load_mailbox(mailbox) {

  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  //fetch query
  
  let url = `/emails/${mailbox}`;
  ask_from_api(url);
  
}

function ask_from_api(url) {
  
  fetch(url)
  .then(response => response.json())
  .then((emails)=>{
     
    if ("error" in emails ){
        populate_error(emails.error)
      } else {
        populate_emails(emails)
      }
      
    })

}

function populate_error(mesg) {

  document.querySelector('#emails-view').append(mesg)
  
}

function populate_emails(emails) {

  if (emails.length == 0) {
    document.querySelector('#emails-view').append("No Emails Found")
  }
  


}

function email_submitted(event){

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: 'baz@example.com',
        subject: 'Meeting time',
        body: 'How about we meet tomorrow at 3pm?'
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });

  return false;
}

function make_email_object(recipients, subject, body) {

  return {
    recipients: recipients,
    subject: subject,
    body: body
  }
  
}