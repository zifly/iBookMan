const fs=require('fs');

strArr=new Array(3,100,101,104,105,106,108,111,112,113,118,119,129,200,208,501,502,503,504,524,525,529,534,535,547);
intArr=new Array(115,116,121,125,201,202,204,205,206,207,401,402,403,404,405,406,542);
binArr=new Array(131,203,209,300);

//myargs=process.argv.splice(2);
//sFile=myargs[0];

/**
 * azw3和mobi文件中读取书籍标签信息
 * sfile为完整路径的文件
 * 返回值：this.header 关联数组
 * 错误返回:this.err 字符串
 * 常用键名:100,101,104,113,501,503,524,999
 * 100：作者
 * 101：出版社
 * 104：ISBN号
 * 113: ASIN号（亚马逊自编号）,标准长度为10，有些电子书制作软件此处放软件自编号
 * 501: EBOK/PDOC标志
 * 503: update title 大多数文件此处放书名，也有为空的
 * 524: language: 语言缩写 字符串 zh en...
 * 999: 从标签外取得的fullName书籍名称
 **/
//Example:
//myheader=bookHeader("./temp/1002.epub")
//if(myheader.err!="") console.log(myheader.err);
//else{
//    bookdatastr=JSON.stringify(myheader.header);
//    console.log(bookdatastr)

//}


function bookHeader(sFile){
    var bookInfo={
        bookname:{},
        EXTH:{
            offsetpos:0,
            length:0,
            labcount:0,
            labs:[]
        }
        
    };
    var err=""
    if(fs.existsSync(sFile)){
         
         myBuffer=fs.readFileSync(sFile);
         pos=60
         headerbuff=myBuffer.slice(pos,pos+8);
         headflag=headerbuff.toString();
         //console.log(headflag);
         if(headflag!="BOOKMOBI"){
             //console.log("不能读取的书籍格式："+sFile);
             err="不能读取的书籍格式："+sFile;
             this.header=bookInfo;
             this.err=err;
             return this;
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
         //get book name 获取书籍名称
         nameinfopos=pos;
         nameoffbuff=myBuffer.slice(pos,pos+4);
         nameoffset=intConv(nameoffbuff);
         //console.log("nameoffset:"+nameoffset)
         pos=pos+4
         namelengthbuff=myBuffer.slice(pos,pos+4)
         namelength=intConv(namelengthbuff);
         //console.log("name length:"+namelength)
         //pos=pos+4
         namepos=pdblength+nameoffset;
         namebuff=myBuffer.slice(namepos,namepos+namelength);
         namestr=namebuff.toString();
         
         if(namestr!=""){
            nameinfo={
                'nameinfopos':nameinfopos,
                'nameoffset':nameoffset,
                'namelengthoffset':pos,
                'namelength':namelength,
                'namepos':namepos,
                'name':namestr,
            }
            bookInfo['bookname']=nameinfo
          } 

         nextmobipos=humlength-72;
         
         //开始EXTH标签头
         //标签开始位置：pdblength开始的话，mobiheader长度为256,azwheader长度288 
         //pos=pdblength+mobiheader|azwheader
         //从humlength位置判断，则不需要判断是那个头文件长度
         //4字节标识:exth 跳过
         //4字节 exth长度
         bookInfo.EXTH['offsetpos']=pos+nextmobipos;
         pos=pos+nextmobipos+4;
         lengthbuff=myBuffer.slice(pos,pos+4)
         exthlength=intConv(lengthbuff);
         bookInfo.EXTH['length']=exthlength;
         //console.log("exthlength="+exthlength)
         pos=pos+4
         //4byte 标签个数
         countbuff=myBuffer.slice(pos,pos+4)
         countlength=intConv(countbuff);
         bookInfo.EXTH['labcount']=countlength;
         //console.log("countlength:"+countlength);

         pos=pos+4

         //开始标签循环
         rnum=0;
         while(rnum<countlength){
            tempbuff=myBuffer.slice(pos,pos+4);
            lab=intConv(tempbuff);
            labtype=getlabType(lab);
            laboffset=pos;
            
            pos=pos+4;
            tempbuff=myBuffer.slice(pos,pos+4);
            num2=intConv(tempbuff);
            lablength=num2;  //含前面lab名称的4个字节和lab内容长度的4字节
            
            pos=pos+4
            conlength=num2-8;
            conbuff=myBuffer.slice(pos,pos+conlength);
        
            switch(labtype){
                case 0:
                    constr=conbuff.toString();
                    
                    labcontent={
                        "type":"String",
                        "data":constr
                    }
                    //labcontent=constr
                    break;
                case 1:
                    constr=intConv(conbuff);
                    
                    labcontent={
                        "type":"Integer",
                        "data":constr
                    }
                    //labcontent=constr
                    break;
                default:
                    labcontent=conbuff;
                    //constr=""
            }

            labinfo={
                'lab':lab,
                'laboffset':laboffset,
                'lablength':lablength,
                'labcontent':labcontent
            }
            bookInfo.EXTH.labs.push(labinfo);

            pos=pos+conlength;
            rnum++;
         }

         
    }
    else{
        err="找不到书籍文件:"+sFile;
    }
    this.header=bookInfo;
    this.book=sFile;
    this.err=err;
    return this;
}

module.exports=bookHeader



//private functions
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