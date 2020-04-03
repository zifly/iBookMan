const fs=require('fs');

strArr=new Array(3,100,101,104,105,106,108,111,112,113,118,119,129,200,208,501,502,503,504,524,525,529,534,535,547);
intArr=new Array(115,116,121,125,201,202,204,205,206,207,401,402,403,404,405,406,542);
binArr=new Array(131,203,209,300);


/**
 * azw3和mobi文件中读取书籍标签信息
 * $myfile为带相对路径的文件
 * 返回值为关联数组
 * 键名:100,101,104,113,501,503,524,999
 * 100：作者
 * 101：出版社
 * 104：ISBN号
 * 113: ASIN号（亚马逊自编号）,标准长度为10，有些电子书制作软件此处放软件自编号
 * 501: EBOK/PDOC标志
 * 503: update title 大多数文件此处放书名，但也有为空的
 * 524: language
 * 999: 从标签外取得的fullName书籍名称
 **/
myheader=openfilebin("./1003.mobi")
bookdatastr=JSON.stringify(myheader);
console.log(bookdatastr)


function openfilebin(sFile){
    var bookInfo={};

    if(fs.existsSync(sFile)){
         
         myBuffer=fs.readFileSync(sFile);
         pos=60
         headerbuff=myBuffer.slice(pos,pos+8);
         headflag=headerbuff.toString();
         //console.log(headflag);
         if(headflag!="BOOKMOBI"){
             console.log("不能读取的书籍格式："+sFile);
             return bookInfo;
         }
         pos=pos+18
         headerbuff=myBuffer.slice(pos,pos+4);
         pdblength=intConv(headerbuff)
         //console.log("PDBHeader:"+pdblength);
         pos=pdblength+20;
         
         humbuff=myBuffer.slice(pos,pos+4);
         humlength=intConv(humbuff);
         //console.log("humheader:"+humlength)
         pos=pos+64
         nameoffbuff=myBuffer.slice(pos,pos+4);
         nameoffset=intConv(nameoffbuff);
         //console.log("nameoffset:"+nameoffset)
         pos=pos+4
         namelengthbuff=myBuffer.slice(pos,pos+4)
         namelength=intConv(namelengthbuff);
         //console.log("name length:"+namelength)
         pos=pos+4

         namepos=pdblength+nameoffset;
         namebuff=myBuffer.slice(namepos,namepos+namelength);
         namestr=namebuff.toString();
         
         if(namestr!="") bookInfo["999"]=namestr;

         nextmobipos=humlength-76;
         pos=pos+nextmobipos+8
         countbuff=myBuffer.slice(pos,pos+4)
         countlength=intConv(countbuff);
         console.log("countlength:"+countlength);

         pos=pos+4

         //开始标签循环
         rnum=0;
         while(rnum<countlength){
            tempbuff=myBuffer.slice(pos,pos+4);
            lab=intConv(tempbuff);
            labtype=getlabType(lab);

            pos=pos+4;
            tempbuff=myBuffer.slice(pos,pos+4);
            num2=intConv(tempbuff);
            pos=pos+4
            conlength=num2-8;
            conbuff=myBuffer.slice(pos,pos+conlength);
            switch(labtype){
                case 0:
                    constr=conbuff.toString();
                    break;
                case 1:
                    constr=intConv(conbuff);
                    break;
                default:
                    //constr=conbuff;            
                    constr=""
            }
            
            pos=pos+conlength;
            if(constr!=""){
                bookInfo[lab]=constr;
            }
            
            rnum++;
         }

         
    }
    return bookInfo;
}

function getlabType(labstr){
    tnum=-1;
    //console.log(labstr+"--"+strArr[1])
    for(i=0;i<strArr.length;i++){
        lab2=strArr[i];
        if(labstr==lab2){
            tnum=0;
            
            return tnum;
        }
    }
    
    for(k=0;k<intArr.length;k++){
        lab2=intArr[k];
        console.log
        if(labstr==lab2){
            tnum=1;
            return tnum;
        }
    }

    return tnum;

}

function intConv(buff){
    hexnum=buff.toString('hex')
    sint=parseInt(hexnum,16);
    return sint;
}