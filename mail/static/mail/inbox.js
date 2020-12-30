document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'))
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'))
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'))
  document.querySelector('#compose').addEventListener('click', compose_email)

  // By default, load the inbox
  load_mailbox('inbox')
})

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none'
  document.querySelector('#compose-view').style.display = 'block'

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = ''
  document.querySelector('#compose-subject').value = ''
  document.querySelector('#compose-body').value = ''
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block'
  document.querySelector('#compose-view').style.display = 'none'
  document.querySelector('#email-view').style.display = 'none'

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`
  tableCreate(mailbox)

}

const sendMail = () => {
  event.preventDefault()
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result)
  })
  setTimeout(() => {
    load_mailbox('sent')
  }, 500);
}

const tableCreate = (mailbox) => {

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      console.table(emails);
      emails.forEach(email => {
        const newEmail = document.createElement('div')
        newEmail.id = `${email.id}`
        newEmail.addEventListener('click', () => loadEmail(email.id))



        const sender = document.createElement('div')
        sender.innerHTML = `<strong>${email.sender}`
        const subject = document.createElement('div')
        subject.innerHTML = `${email.subject}`
        const timestamp = document.createElement('div')
        timestamp.innerHTML = `${email.timestamp.slice(0, 10)} ${email.timestamp.slice(11, 16)}`

        newEmail.className = 'container row'

        if(email.read) {
          newEmail.setAttribute('style', 'cursor:pointer;border:black 1px solid;background:#dedede')
        } else {
          newEmail.setAttribute('style', 'cursor:pointer;border:black 1px solid;')
        }


        sender.className = 'col-3'
        subject.className = 'col-6'
        timestamp.className = 'col-3'

        newEmail.appendChild(sender)
        newEmail.appendChild(subject)
        newEmail.appendChild(timestamp)
        document.querySelector('#emails-view').appendChild(newEmail)
      })
    })
}

const loadEmail = (id) => {
  document.querySelector('#emails-view').style.display = 'none'
  document.querySelector('#compose-view').style.display = 'none'
  document.querySelector('#email-view').style.display = 'block'

  document.querySelector('#email-view').innerHTML = '';

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {

    const thisEmail = document.createElement('div');

    const timestampValue = `${email.timestamp.slice(0, 10)} ${email.timestamp.slice(11, 16)}`

    const sender = document.createElement('div');
    sender.innerHTML = `<strong>From:</strong> ${email.sender}`;
    const recipients = document.createElement('div');
    recipients.innerHTML = "<strong>To:</strong> " + email.recipients.join(', ')
    const subject = document.createElement('div');
    subject.innerHTML = `<strong>Subject:</strong> ${email.subject}`;
    const timestamp = document.createElement('div')
    timestamp.innerHTML = `<strong>Timestamp:</strong> ${timestampValue}`;
    const reply = document.createElement('button');
    reply.className = 'btn btn-sm btn-outline-primary';
    reply.innerHTML = 'Reply';
    reply.addEventListener('click', () => replyMail(email.sender, email.subject, email.body, timestampValue))

    const archive = document.createElement('button');
    archive.className = 'btn btn-sm btn-outline-primary ml-1';

    if(email.archived) {
      archive.innerHTML = 'Unarchive';
      archive.addEventListener('click', () => archiveMail(id, false));
    } else {
      archive.innerHTML = 'Archive';
      archive.addEventListener('click', () => archiveMail(id, true));
    }
    const content = document.createElement('div');
    content.innerHTML = `${email.body}`;

    thisEmail.appendChild(sender);
    thisEmail.appendChild(recipients);
    thisEmail.appendChild(subject);
    thisEmail.appendChild(timestamp);
    thisEmail.appendChild(reply);
    thisEmail.appendChild(archive);
    thisEmail.appendChild(document.createElement('hr'));
    thisEmail.appendChild(content);

    document.querySelector('#email-view').appendChild(thisEmail);
  })
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
  .then(response => console.log(response))
}

const archiveMail = (id, status) => {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: status
    })
  })
    .then(response => console.log(response.status))
  setTimeout(() => {
    load_mailbox('inbox')
  }, 500);
}

const replyMail = (recipient, subject, body, timestamp) => {

  document.querySelector('#compose-view>h3').innerHTML = 'Replying'

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  document.querySelector('#compose-recipients').value = recipient
  if (subject.slice(0, 2) != 'RE') {
    document.querySelector('#compose-subject').value = `RE: ${subject}`;
  } else {
    document.querySelector('#compose-subject').value = subject;
  }
  document.querySelector('#compose-body').value = `On ${timestamp} ${recipient} wrote:
  ${body}
-----------------------------------------------------------------
`
  document.querySelector('#compose-body').autofocus = true;

}