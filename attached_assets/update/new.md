
AppScript

function doPost(e) {
    const sheetUrl = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1V4KRS8J5CGostWXRA1jJB82rMQb1BiyoaxKuXpK8Spw/edit?gid=0#gid=0")
  
    const sheet = sheetUrl.getSheetByName('Sheet1')
  
    let data = e.parameter
    sheet.appendRow([data.Name,data.Email])
  
    return ContentService.createTextOutput('Added..')
  }
  
---


  FormToSheet

  import React from 'react'

function FormToSheet() {

  const handleSubmit = (e)=>{
    e.preventDefault()
    const url = "hosted sheet url"
    fetch(url,{
      method:"POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:(`Name=${e.target.name.value}&Email=${e.target.email.value}`)
    }).then(res=>res.text()).then(data=>{
      alert(data)
    }).catch(error=>console.log(error))
  }


  return (
    <div>
        <h1>React to Sheet</h1>
        <form onSubmit={handleSubmit}>
          <input name='name' placeholder='Name 1' /> <br/>
          <input name='email' placeholder='Email 1' /> <br/>
          <button>Add</button>
        </form>
    </div>
  )
}
