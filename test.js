const fs=require('fs');
const header=require("./kindleheader.js")

book="./temp/1001.azw3";
myheader=header(book);

if(myheader.err!="") console.log(myheader.err);
else{
    bookdatastr=JSON.stringify(myheader.header);
    console.log(bookdatastr)

}