import moment from 'moment';
import lodash from 'lodash';

export async function getSchedulingDate(date) {
  try{
    let response = await fetch("/api/datesupreme/"+moment(date).format('YYYY-MM-DD'), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return await response.json();
  }catch(err){
    console.error(err);
    return false;
  }
}

export async function getSchedulingWeek(date) {
  try {
    const weekNum = moment(date, "YYYY-MM-DD").isoWeek();
    const begin = moment(date, "YYYY-MM-DD").startOf('isoWeek');
    const end = moment(date, "YYYY-MM-DD").endOf('isoWeek');

    const current = moment(begin);
    const next = moment.prototype.add.bind(current, 1, 'day');

    const week = await Promise.all(lodash.times(7, (i) => {
      const request = getSchedulingDate(current);
      next();
      return request;
    }));

    return {
      weekNum: weekNum
      , weekBegin: begin.format('YYYY-MM-DD')
      , weekEnd: end.format('YYYY-MM-DD')
      , week: week
    };
  } catch(err) {
    console.error(err);
    return false;
  }
}

export function dayToString(i) {
  let lang = "fi"; //fallback
  if(localStorage.getItem("language") === '0') {
    lang = 'fi';
  }
  else if(localStorage.getItem("language") === '1'){
    lang = 'en';
  }
  moment.locale(lang);
  //en/fi have different numbers for start date
  if(lang === 'fi') i--;
  const dayString = moment().weekday(i).format('dddd');
  //first letter only to uppercase
  return dayString.charAt(0).toUpperCase() + dayString.slice(1);
}

export function monthToString(i) {
  let lang = "fi"; //fallback
  if(localStorage.getItem("language") === '0') {
    lang = 'fi';
  }
  else if(localStorage.getItem("language") === '1'){
    lang = 'en';
  }
  moment.locale(lang);
  return moment().month(i).format('MMMM');
}

/* 
  Validates the login token

  return: boolean, is token valid (true = yes)
*/
export async function validateLogin() {
  const token = localStorage.getItem('token');
  let response;
  if ( token !== null ) {
    try {
      response = await fetch("/api/validate", {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });
    }
    catch (error) {
      // console.log won't have time to be read before user is rerouted, so commented out for future use
      // console.log(`Authorization validation failed `, error);
      return false;
    }
  }

  if (response && response.status && response.status === 200) {
    return true;
  }
  else {
    return false;
  }
}

//on success true
//else returns string trying to explain what broke
//requires reservation and schedule to exist
export async function rangeSupervision(rsId,srsId,rangeStatus,rsScheduled,token){
  try{
    if(rsId !== null && srsId !== null){
      //only closed is different from the 6 states
      if(rangeStatus !== 'closed'){
        //range supervision exists
        if(rsScheduled){
          //changing supervision force reservation open
          await fetch(`/api/reservation/${rsId}`, {
            method: "PUT",
            body: JSON.stringify({available: true}),
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          })
          .then(status => {
            if(!status.ok) throw new Error('scheduled reserv fail');
          });
          
          //update supervision
          await fetch(`/api/range-supervision/${srsId}`, {
            method: "PUT",
            body: JSON.stringify({range_supervisor: rangeStatus}),
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          })
          .then(status => {
            if(!status.ok) throw new Error('scheduled superv fail');
          });
        }
        //no supervision exists
        else{
          //changing supervision force reservation open
          await fetch(`/api/reservation/${rsId}`, {
            method: "PUT",
            body: JSON.stringify({available: true}),
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          })
          .then(status => {
            if(!status.ok) throw new Error('not scheduled reserv fail');
          });
          
          //add new supervision
          await fetch(`/api/range-supervision`, {
            method: "POST",
            body: JSON.stringify({
              scheduled_range_supervision_id:srsId,
              range_supervisor: rangeStatus
            }),
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          })
          .then(status => {
            if(!status.ok) throw new Error('not scheduled superv fail');
          });
        }
      } else {
        //range closed update reservation
        await fetch(`/api/reservation/${rsId}`, {
          method: "PUT",
          body: JSON.stringify({available: 'false'}),
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })
        .then(status => {
          if(!status.ok) throw new Error('reservation update failed');
        });
      }
    }else throw new Error('reservation or schedule missing');
  }catch(e){
    return 'general range supervision failure: '+ e;
  }
  return true;
}