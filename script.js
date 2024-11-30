document.addEventListener("DOMContentLoaded", function(){

    const searchButton = document.getElementById("searchBtn");
    const usernameInput = document.getElementById("userInput");
    const statsContainer = document.querySelector(".statsContainer");
    const easyProgressCircle = document.querySelector(".easyProgress");
    const mediumProgressCircle = document.querySelector(".mediumProgress");
    const hardProgressCircle = document.querySelector(".hardProgress");
    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const cardStatsContainer = document.querySelector(".stats-card");

    

    // return true or false based on a regular expression (regex)
    function validateUsername(username){
        if(username.trim() === ""){
            alert("Username should not be empty!");
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        const isMatching = regex.test(username);
        if(!isMatching){
            alert("Invalid username!");
        }
        return isMatching;
    }

    async function fetchUserDetails(username){
        // const url =`https://leetcode-stats-api.herokuapp.com/${username}`
        try{
            searchButton.textContent = "Searching...";
            searchButton.disabled = true;

            // const response = await fetch(url);
            const proxyUrl = `https://cors-anywhere.herokuapp.com/`
            const targetUrl = `https://leetcode.com/graphql/`;
            // concatinated Url: https://cors-anywhere.herokuapp.com/https://leetcode.com/graphql/
            const myHeaders = new Headers()
            myHeaders.append("content-type", "application/json");

            const graphql = JSON.stringify({
                query: "\n  query userSessionProgress($username: String!) {\n   allQuestionsCount {\n   difficulty\n    count\n     }\n     matchedUser(username : $username) {\n      submitStats {\n     acSubmissionNum {\n difficulty\n    count\n     submissions\n   }\n totalSubmissionNum {\n  difficulty\n    count\n     submissions\n   }\n     }\n     }\n  }", 
                variables: {"username" : `${username}`}

            })
            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
                redirect: "follow"
            };

            const response = await fetch(proxyUrl + targetUrl, requestOptions)
            if(!response.ok){
                throw new Error("Unable to fetch the User Details");
            }
            const parsedData = await response.json();
            console.log("logging data: ", parsedData);

            displayUserData(parsedData);
        }
        catch(error){
            statsContainer.innerHTML = `<p>${error.message}</p>`
        }
        finally{
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }


    function upgradeProgress(solved, total, label, circle) {
        const progressDegree = (solved/total)*100;
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        label.textContent = `${solved}/${total}`;
    }

    function displayUserData(parsedData) {
        // total questions
        const totalQues = parsedData.data.allQuestionsCount[0].count;
        const totalEasyQues = parsedData.data.allQuestionsCount[1].count;
        const totalMediumQues = parsedData.data.allQuestionsCount[2].count;
        const totalHardQues = parsedData.data.allQuestionsCount[3].count;
        // console.log(totalEasyQues)

        // total solved questions
        const totalSolved = parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const totalEasySolved = parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const totalMediumSolved = parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const totalHardSolved = parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;

        // update progress
        upgradeProgress(totalEasySolved, totalEasyQues, easyLabel, easyProgressCircle);
        upgradeProgress(totalMediumSolved, totalMediumQues, mediumLabel, mediumProgressCircle);
        upgradeProgress(totalHardSolved, totalHardQues, hardLabel, hardProgressCircle);

        // card Data
        const cardsData = [
            {label: "Overall Submissions: ", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[0].submissions  },
            {label: "Overall Easy Submissions: ", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[1].submissions  },
            {label: "Overall Medium Submissions: ", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[2].submissions  },
            {label: "Overall Hard Submissions: ", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[3].submissions  }
        ];

        // console.log(cardData)

        cardStatsContainer.innerHTML = cardsData.map(
            data => {
                return `
                    <div class="card">
                        <h3>${data.label}</h3>
                        <p>${data.value}</p>
                    </div>
                `
            }
        )
    }

    searchButton.addEventListener('click', function (){
        const username = usernameInput.value;
        console.log("logging username: ", username);
        if(validateUsername(username)){
            // fetch data from API
            fetchUserDetails(username);

        }
    })


})
