import React, { Component } from "react";
import './App.css';
import './Weekview.css'
import {Link} from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import { dayToString, getSchedulingWeek } from "./utils/Utils";
import moment from 'moment'

class Weekview extends Component {

    constructor(props) {
        super(props);
        this.state = {
          weekNro: 0,
          dayNro: 0
        };
    }

    //Updates week to current when page loads
    componentDidMount() {
        this.getWeek();
        this.update();
      }

    //Changes week number state to previous one
    previousWeekClick = () => {

        let testi = moment(this.state.dayNro, "YYYYMMDD")
        
        testi.subtract(1, 'week')

        let previous;
        //Week logic cuz you can't go negative
        if (this.state.weekNro === 1 ) {
            previous = 52
        } else {
            previous = this.state.weekNro-1
        }
        this.setState(
            {
              dayNro: testi,
              weekNro: previous
            },
            function() {
              this.update();
            }
        );
    }

    //Changes week number state to next one
    nextWeekClick = () => {

        let testi = moment(this.state.dayNro, "YYYYMMDD")
        
        testi.add(1, 'week')

        let previous;
        //Week logic cuz there's no 53 weeks
        if (this.state.weekNro === 52 ) {
            previous = 1
        } else {
            previous = this.state.weekNro+1
        }
        this.setState(
            {
              dayNro: testi,
              weekNro: previous
            },
            function() {
              this.update();
            }
        );
    }

    //Function for parsin current week number
    getWeek = () => {
        var date1 = new Date();
        date1.setHours(0, 0, 0, 0);
        date1.setDate(date1.getDate() + 3 - (date1.getDay() + 6) % 7);
        var week1 = new Date(date1.getFullYear(), 0, 4);
        var current = 1 + Math.round(((date1.getTime() - week1.getTime()) / 86400000
        - 3 + (week1.getDay() + 6) % 7) / 7);
        this.setState({weekNro: current})
        return current;
    }

    //Creates 7 columns for days
    createWeekDay = () => {

        //Date should come from be?
        let table = []
        let pv;
    
        for (let j = 1; j < 8; j++) {
            pv = dayToString(j);
            //Korjausliike ku utilsseis sunnuntai on eka päivä
            if (j === 7) {
                pv = "Sunnuntai"
            }
            table.push(
                <Link className="link">
                <p id ="weekDay">
                    {pv}
                </p>
                </Link>
                )
            }
        return table
    }

    //Creates 7 columns for days
    createDate = () => {

        let table = []

        if (this.state.paivat === undefined) {
            
        }
        else {
            let oikeePaiva;
            let fixed;
            let newDate;
            for (let j = 0; j < 7; j++) {
                oikeePaiva = this.state.paivat[j].date
                fixed = oikeePaiva.split("-")
                newDate = fixed[2] + "." + fixed[1]
                table.push(
                    <Link class="link" to="/dayview">
                    <p style={{ fontSize: "medium" }}>
                    {newDate}
                    </p>
                    </Link>
                    )
                }
            return table 
        }
      }

    //Creates 7 columns for päävalvoja info, colored boxes
    createColorInfo = () => {

        //Color from be?
        //If blue, something is wrong
        let colorFromBackEnd = "blue"
        let table = []

        if (this.state.paivat === undefined) {
            
        }
        else {
            let rataStatus;
            let oikeePaiva;
            let linkki;
            for (let j = 0; j < 7; j++) {

                //Luodaan väri 

                rataStatus = this.state.paivat[j].rangeSupervision
                console.log("ratastatus",rataStatus);

                if (rataStatus === "present") {
                    colorFromBackEnd = "green"
                } else if (rataStatus === "confirmed") {
                    colorFromBackEnd = "lightGreen"
                } else if (rataStatus === "not confirmed") {
                    colorFromBackEnd = "blue"
                } else if (rataStatus === "en route") {
                    colorFromBackEnd = "yellow"
                } else if (rataStatus === "closed") {
                    colorFromBackEnd = "red"
                } else if (rataStatus === "absent") {
                    colorFromBackEnd = "white"
                }

                oikeePaiva = this.state.paivat[j].date
                linkki = "/dayview/" + oikeePaiva
                table.push(
                    <Link style={{ backgroundColor: `${colorFromBackEnd}` }} class="link" to={linkki}>
                    <p>
                    &nbsp;
                    </p>
                    </Link>
                    )
                }   
            return table  
        }
    }

    update() {
        // /dayview/2020-02-20
        let testi2;
        if (this.state.dayNro === 0) {
            let today = new Date();
            let dd = String(today.getDate()).padStart(2, '0');
            let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            let yyyy = today.getFullYear();
    
            today = yyyy + '-' + mm + '-' + dd;

            let testi = moment(yyyy + mm + dd, "YYYYMMDD")

            this.setState({
                dayNro: testi
            })
            console.log("tanaan on " + testi.format('L'))
            testi2 = testi.format("YYYY-MM-DD")
        }
        else {
            testi2 = this.state.dayNro.format("YYYY-MM-DD")
        }

        let date = testi2;
        const request = async () => {
          const response = await getSchedulingWeek(date);

          if(response !== false){
            console.log("Results from api",response);

            this.setState({
              paivat:response.week
            });
          } else console.error("getting info failed");
        } 
        request();
      }

    render() {

        return (
            
        <div>
            <div class="container">
                {/* Header with arrows */}
                <Grid class="date-header">
                    <div
                    className="hoverHand arrow-left"
                    onClick={this.previousWeekClick}
                    ></div>
                    <h1> Viikko {this.state.weekNro} </h1>
                    {/* kuukausi jos tarvii: {monthToString(date.getMonth())} */}
                    <div
                    className="hoverHand arrow-right"
                    onClick={this.nextWeekClick}
                    ></div>
                </Grid>

                {/* Date boxes */}
                <Grid class="flex-container2">
                    {this.createWeekDay()}
                </Grid>
    
                {/* Date boxes */}
                <Grid class="flex-container2">
                    {this.createDate()}
                </Grid>
    
                <div>
                {/* Colored boxes for dates */}
                <Grid class="flex-container">
                    {this.createColorInfo()}
                </Grid>
                </div>
                </div>
    
                {/* Infoboxes */}
    
                {/* Top row */}
                {/* To do: Tekstit ei toimi */}
                <hr></hr>
                <div className="infoContainer">
                <div className="klockan">
                    Aukiolo: 16-20 
                </div>
                <br></br>
                <Grid>
                    <div class="info-flex">

                        <div id="open-info" class='box'></div>
                        {/* Avoinna */} &nbsp;Päävalvoja paikalla&nbsp;&nbsp;&nbsp;&nbsp; <br></br> <br></br>

                        <div id="closed-info2" class='box'></div>
                        {/* Suljettu */} &nbsp;Päävalvoja matkalla <br></br><br></br>

                    </div>                
                </Grid>

    
                {/* Bottom row */}
                <Grid class="bottom-info">
                    <div class="info-flex">

                        <div id="valvoja-info" class='box'></div>
                        {/* Päävalvoja tulossa */} &nbsp;Päävalvoja määritetty<br></br> <br></br>


                        <div id="no-info" class='box'></div>
                        {/* Ei tietoa */} &nbsp;Ei asetettu

                    </div>
                </Grid>


                {/* Bottom row */}
                <Grid class="bottom-info">
                    <div class="info-flex">


                        <div id="closed-info" class='box'></div>
                        {/* Suljettu */} &nbsp;Keskus suljettu&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <br></br><br></br>

                    </div>
                </Grid>
                </div> 
            </div>
            
        );
    }
}

export default Weekview;