import React from 'react';
import './App.css';
import './Weekview.css'
import {Link} from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import { monthToString } from "./utils/Utils";

function Weekview() {

    let date = new Date(Date.now());

    var currentYear = date.toLocaleDateString().split(".")[2];

    var dateNow = 1
    var monthNow = 1
    var yearNow = 2020

    var dayParams = "?q=" + dateNow + monthNow + yearNow;
    var dayUrl = "/dayview" + dayParams;

    var date1 = new Date(date.getTime());
    date1.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date1.setDate(date1.getDate() + 3 - (date1.getDay() + 6) % 7);
    // January 4 is always in week 1.
    var week1 = new Date(date1.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    var weekNow = 1 + Math.round(((date1.getTime() - week1.getTime()) / 86400000
                            - 3 + (week1.getDay() + 6) % 7) / 7);

    return (
        <div>
        <div class="container">
            {/* Header with arrows */}
            <Grid class="date-header">
                <h1> Viikko {weekNow} {monthToString(date.getMonth())}</h1>
            </Grid>

            {/* Date boxes */}
            <Grid class="flex-container2">
            <Link class="link" to={dayUrl}>
                <p style={{ fontSize: "medium" }}>
                {dateNow}.{monthNow}
                </p>
                </Link>

                <Link class="link" to="/dayview">
                <p style={{ fontSize: "medium" }}>
                {dateNow + 1}.{monthNow}
                </p>
                </Link>

                <Link class="link" to="/dayview">
                <p style={{ fontSize: "medium" }}>
                {dateNow + 2}.{monthNow}
                </p>
                </Link>

                <Link class="link" to="/dayview">
                <p style={{ fontSize: "medium" }}>
                {dateNow + 3}.{monthNow}
                </p>
                </Link>

                <Link class="link" to="/dayview">
                <p style={{ fontSize: "medium" }}>
                {dateNow + 4}.{monthNow}
                </p>
                </Link>

                <Link class="link" to="/dayview">
                <p style={{ fontSize: "medium" }}>
                {dateNow + 5}.{monthNow}
                </p>    
                </Link>

                <Link class="link" to="/dayview">
                <p style={{ fontSize: "medium" }}>
                {dateNow + 6}.{monthNow}
                </p>
                </Link>
            </Grid>

            <div>
            {/* Colored boxes for dates */}
            <Grid class="flex-container">
                <Link style={{ backgroundColor: "orange" }} class="link" to="/dayview">
                <p>
                &nbsp;
                </p>
                </Link>

                <Link style={{ backgroundColor: "green" }} class="link" to="/dayview">
                <p style={{ fontSize: "medium" }}>
                &nbsp;
                </p>
                </Link>

                <Link style={{ backgroundColor: "red" }} class="link" to="/dayview">
                <p style={{ fontSize: "medium" }}>
                &nbsp;
                </p>
                </Link>

                <Link style={{ backgroundColor: "green" }} class="link" to="/dayview">
                <p style={{ fontSize: "medium" }}>
                &nbsp;
                </p>
                </Link>

                <Link style={{ backgroundColor: "white" }} class="link" to="/dayview">
                <p style={{ fontSize: "medium" }}>
                &nbsp;
                </p>
                </Link>

                <Link style={{ backgroundColor: "green" }} class="link" to="/dayview">
                <p style={{ fontSize: "medium" }}>
                &nbsp;
                </p>
                </Link>

                <Link style={{ backgroundColor: "red" }} class="link" to="/dayview">
                <p style={{ fontSize: "medium" }}>
                &nbsp;
                </p>
                </Link>
            </Grid>
            </div>
            </div>
            


            
            {/* Infoboxes */}

            {/* Top row */}
            {/* To do: Tekstit ei toimi */}
            <div class="infoContainer">
            <Grid>
                <div class="info-flex">
                    <div id="open-info" class='box'></div>
                    {/* Avoinna */} &nbsp;Avoinna <br></br> <br></br>
                    <div id="valvoja-info" class='box'></div>
                    {/* Päävalvoja tulossa */} &nbsp;Päävalvoja tulossa<br></br> <br></br>
                </div>
            </Grid>

            {/* Bottom row */}
            <Grid class="bottom-info">
                <div class="info-flex">
                    <div id="closed-info" class='box'></div>
                    {/* Suljettu */} &nbsp;Suljettu <br></br><br></br>
                    <div id="no-info" class='box'></div>
                    {/* Ei tietoa */} &nbsp;Ei tietoa
                </div>
            </Grid>
            </div>
        </div>
    );
}

export default Weekview;