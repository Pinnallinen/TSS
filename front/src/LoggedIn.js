import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import axios from 'axios';
import moment from 'moment';

//print drop down menus in rows
const DropDowns = (props) => {
  let id = props.d;
  let obj = props.changes.find(o => o.date===id);
  let text = "Vahvista saapuminen";
  let color = "white";
  if(obj.range_supervisor==="confirmed" || obj.range_supervisor==="en route") {
    text = "Saavun paikalle";
    color = "green";
  }
  if(obj.range_supervisor==="absent") {
    text = "En pääse paikalle";
    color = "red";
  }  
  const [buttonText, setButtonText] = useState(text);
  const [buttonColor, setButtonColor] = useState(color);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const styleB = {
    left:270,
    position:"absolute"

  }
  const buttonStyle = {
    backgroundColor:`${buttonColor}`
  }
  const discardChanges = {
    color:"lightgray"
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const HandleClose = (event) => {
    //data to be sent is in info
    //empty info means date is not confirmed

    if(event.currentTarget.dataset.info==="") {
      setButtonText("Vahvista saapuminen")
      setButtonColor("white");
      obj.range_supervisor = "present";
    }
    if(event.currentTarget.dataset.info==="y") {
      setButtonText("Saavun paikalle")
      setButtonColor("green");
      obj.range_supervisor = "confirmed";
    }
    if(event.currentTarget.dataset.info==="n") {
      setButtonText("En pääse paikalle");
      setButtonColor("red");
      obj.range_supervisor = "absent";
    }
    props.changes.map(o => (o.date===id ? obj : o))
    console.log(props.changes.find(o => o.date===id));
    
    setAnchorEl(null);
  }
  
  return (
    <span style={styleB}>
      
      <Button
        onClick={handleClick}
        variant="outlined"
        size="small"
        style={buttonStyle}>
        {buttonText}
      </Button>
      
      <Menu
        id={props.d}
        open={Boolean(anchorEl)}
        keepMounted
        anchorEl={anchorEl}
        onClose={HandleClose}>
        
        <MenuItem
          onClick={HandleClose}
          data-info=""
          style={discardChanges}>
          Vahvista saapuminen
        </MenuItem>
        
        <MenuItem
          onClick={HandleClose}
          data-info="y">
          Saavun paikalle
        </MenuItem>
        
        <MenuItem
          onClick={HandleClose}
          data-info="n">
          En pääse paikalle
        </MenuItem>

      </Menu>

      &nbsp;
      {props.today===props.d ?
       <Check HandleChange={props.HandleChange} checked={props.checked} />
       : "" }

    </span>
  )
}

//prints matkalla-checkbox
const Check = ({HandleChange, checked}) => {
  return (
    <>
      <FormControlLabel control={
        <Checkbox
          checked={checked}
          style={{color:"orange"}}
          onChange={HandleChange}
        />}
        label="Matkalla" />
      
    </>
  )
}

//prints date info in rows
const Rows = ({HandleChange, changes, checked, setDone}) => {
  const styleA = {
    padding:30,
    marginLeft:30,
    flexDirection:"row",
    display:"inline-flex",
    fontSize:18
  }

  setDone(true);
  
  function getWeekday(day) {
    day = moment(day).format('dddd')
    return day.charAt(0).toUpperCase() + day.slice(1);
  }

  function getDateString(day) {
    let parts = day.split("-")
    return `${parts[2]}.${parts[1]}.${parts[0]}`
  }
  
  let today = moment().format().split("T")[0];

  return (   
    changes.map(d =>
                <div key={d.date} style={styleA}>
                  {getWeekday(d.date)} {getDateString(d.date)}
		  <DropDowns d={d.date} today={today} changes={changes}
		             HandleChange={HandleChange} checked={checked}  />
                </div>  
               )
  )
}


//TODO: change config after relocating jwt
async function getId() {
  let name = localStorage.getItem("taseraUserName");
  console.log("username:", name);
  
  let token = localStorage.getItem("token");
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  
  let query = "api/user?name=" + name;
  let response = await axios.get(query, config);
  //let response = await axios.get(query);
  
  let userID = response.data[0].id;
  console.log("userID:", userID);

  return userID;
}

//obtain date info
async function getReservations(res) {

  let today = moment().format().split("T")[0];
  
  for(let i=0; i<res.length; i++) {
    let query = "api/reservation?available=true&id=" + res[i].reservation_id;
    let response = await axios.get(query);
    let d = moment(response.data[0].date).format("YYYY-MM-DD");
    res[i].date = d
  }

  res = res.filter(obj => obj.date >= today);

  res.sort(function(a, b) {
    return new Date(a.date) - new Date(b.date);
  });

  return res;
}

//obtain users schedule and range supervision states
async function getSchedule(setSchedules, setNoSchedule, setChecked, setDone) {
  let userID = await getId();  
  let res = [];
  let temp = [];

  let query = "api/schedule?supervisor_id=" + userID;
  let response = await axios.get(query);
  temp = temp.concat(response.data);

  for(let i=0; i<temp.length; i++) {
    let v = await temp[i];

    let rsquery = "api/range-supervision/" + v.id;
    let rsresponse = await axios.get(rsquery);

    //object id is schedule id
    let obj = {
      "userID": userID,
      "date": "",
      "id": v.id,
      "reservation_id": v.range_reservation_id,
      "range_supervisor": rsresponse.data[0].range_supervisor
    }

    res = await res.concat(obj);
  }
 
  if(res.length===0) {
    await setNoSchedule(true);
    await setDone(true);
    return;
  }
  
  res = await getReservations(res);
  setSchedules(res);
  setChecked(res[0].range_supervisor==="en route");

  console.log("scheduled for user: ", res.length)
  console.log(res)
}

const DialogWindow = () => {
  const [noSchedule, setNoSchedule] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [done, setDone] = useState(false);
  const [checked, setChecked] = useState(false); //user is "en route"

  //starting point
  useEffect(() => {
    getSchedule(setSchedules, setNoSchedule, setChecked, setDone);
  }, [])

  return (
    <div>
      <Logic schedules={schedules} setSchedules={setSchedules}
             noSchedule={noSchedule} checked={checked} setChecked={setChecked}
             done={done} setDone={setDone}/>
    </div>
  )
}

//sends updated info to database
async function putSchedules(changes) {
  console.log("updating: ")
  console.log(changes);

  let token = localStorage.getItem("token");
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  for(let i=0; i<changes.length; i++) {
    let id = changes[i].id;
    let query = "api/range-supervision/" + id;
    let s = changes[i].range_supervisor;
    await axios.put(query,
                    {
                      range_supervisor:s
                    }, config)
    
  }
}

//creates dialog-window
const Logic = ({schedules, setSchedules, noSchedule, checked, setChecked, done, setDone}) => {
  const discardChanges = {
    color:"gray"
  }

  const [open, setOpen] = useState(true);
  let changes = [...schedules];

  const HandleChange = (event) => {
    setChecked(!checked)
  }

  const HandleClose = () => {

    if(checked && changes[0].range_supervisor==="confirmed") {
      let today = moment().format().split("T")[0];
      let obj = changes.find(o => o.date===today);
      obj.range_supervisor = "en route";
      changes.map(o => (o.date===today ? obj : o))
    }
    if(!checked && changes[0].range_supervisor==="en route") {
      changes[0].range_supervisor="confirmed";
    }

    if(changes.length>0) {
      putSchedules(changes);
    }
    
    setOpen(false)
  }
  
  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby="otsikko"
        maxWidth='sm'
        fullWidth={true}>
        
        <DialogTitle id="otsikko">Vahvistettavat valvonnat</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {noSchedule ? "Sinulla ei ole vahvistettavia vuoroja" : ""}
            {done ? "" : "Haetaan vuoroja..."}
          </DialogContentText>
        </DialogContent>

        {schedules.length!==0 ?
         <Rows HandleChange={HandleChange} changes={changes}
               checked={checked} setDone={setDone} />
         : ""}

        <DialogActions>

          <Button
            variant='contained'
            onClick={()=> setOpen(false)}>
            Sulje
          </Button>

          {done && !noSchedule ?
           <Button
             color='primary'
             variant='contained'
             onClick={HandleClose}>
             Tallenna
           </Button>
           : ""
          }

        </DialogActions>

      </Dialog>
    </div>
  )
}

export default DialogWindow