//my std
function makarr(n,f,th){
  var A= new Array(n) ; if(th) f=f.bind(th)
  for(var i=0;i<n;i++) A[i]=f(i) 
  return A
}

eqconfigel=document.getElementById("eqconfig")
equalel=document.getElementById("equalizer")


function mdleqlzr(p,r){
  
  var len=p.nfreq       //number frequencies

  var frq=new Array(len)
  var pwr=new Array(len)	
  
  var afreq=p.afreq     //anchor frequency
  var efreq=p.efreq     //end frequency
  
  var islinear=p.linear
  var afl=Math.log(afreq) , efl=Math.log(efreq)
  
  var linstep = (efreq-afreq)/(len-1)
  var logstep = (efl-afl)/(len-1)
    
  for(var i=0;i<len;i++){
    var cf = islinear ? afreq + i*linstep 
                     : Math.pow(Math.E, afl + logstep*i )
    frq[i]=Math.round(cf)
    pwr[i]=90
  }
  
  //~ if(old) //feed old data in
  
  return { frq:frq, pwr:pwr }
}

EQspec = {
  afreq:64
 ,efreq:16384
 ,nfreq:9
 ,linear:false
}

//init datas
//~ frqs = frqs||[31,62,125,250,500,1000,2000,4000,8000,16000]
//~ frqs = [31,62,125,250,500,1000,2000,4000,8000,16000]
//~ if(!pwrs || pwrs.length!=frqs.length){
  //~ pwrs= new Array(frqs.length)
  //~ for(var c=0;c<frqs.length;c++){ pwrs[c]=90 }
//~ }

function setglobs(){
  
ceqmdl = mdleqlzr(EQspec,{} //old eq to be transformed ...
)
frqs = ceqmdl.frq
pwrs = ceqmdl.pwr

}

setglobs()

var cmin=0,cmax=100,volboost=0.01
var slength="2.75em",swide="20em"


function playztone(key){
  console.log("playing key",key,"frq",frqs[key],"pwr",pwrs[key])
  playonetrill(frqs[key],volboost*pwrs[key]/100)
}

//~ console.log(ceqmdl)

function Form() {

  var cafreq=hztostr(EQspec.afreq)
     ,cefreq=hztostr(EQspec.efreq)
     ,cbands=bntostr(EQspec.nfreq)
     ,clinea=EQspec.linear
     
  function submit(event){
    if(event)event.preventDefault()
    
    var d = strtohz(cafreq)
    d=d<20?20:d>24000?24000:d
    if(isFinite(d)){ EQspec.afreq = d }
    cafreq = hztostr(d)
    
    d = strtohz(cefreq)
    d=d<20?20:d>24000?24000:d
    if(isFinite(d)){ EQspec.efreq = d }
    cefreq = hztostr(d)

    d = cbands
    while(d.length && (!isFinite(d.substr(-1))) ) d=d.slice(0,-1)
    d=d*1;d=d<1?1:d>15?15:d
    if(isFinite(d)){ EQspec.nfreq = d }
    cbands=bntostr(EQspec.nfreq)
    setglobs()
    
    m.mount(equalel, {
      view: function () { return m( mc_eqlzr, {mdl:ceqmdl} ) }
    })

  }

  function bntostr(c){ return c+" Bands" }
  function hztostr(c){
    if(c>1000){ c=Math.round(c) ; c=c/1000+"KHz" }else{ c+="Hz" }
    return c 
  }
  
  function strtohz(c){
    c=c.toLowerCase()
    if(c.substr(-1)==="z") c=c.slice(0,-1)
    if(c.substr(-1)==="h") c=c.slice(0,-1)
    if(c.substr(-1)==="k"){ c=c.slice(0,-1);c*=1000 }
    return c*1
  }
  
  function chkbx(c){
    EQspec.linear=c
    console.log(c)
    submit()
  }
  
  return {
    view: function() {

      return m("form.place-qw",{onsubmit:submit},[
      
      m("fieldset.flex.four",[
       m("input", {
         type:"submit",tabindex:"-1"
        ,style:"position: absolute; left: -9999px; width: 1px; height: 1px;"
        ,onsubmit:submit
       }
       )
       ,
       m("label",m("input",
       {
       oninput: m.withAttr("value", v=>{cafreq=v}),
       value: cafreq
       }
       ))
       ,
       m("label",m("input",
       {
       oninput: m.withAttr("value", v=>{cefreq=v}),
       value: cefreq
       }
       ))
       ,
       m("label",m("input",
       {
       oninput: m.withAttr("value", v=>{cbands=v}),
       value: cbands
       }
       ))
      ,m("label",{style:"padding:0.3em 0.5em;"},[
        m("input[type=checkbox]",{
          onclick: m.withAttr("checked", chkbx)
         ,checked:EQspec.linear
          })
       ,m("span.checkable","Linear")
       ]) 
      ])
     ])
      

      //~ return (
        //~ m('form', {
          //~ onsubmit: function(event) {
            //~ event.preventDefault();
            //~ validateAll(model);
          //~ }
        //~ },
          //~ m('p', 'At least 10 characters:'),
          //~ m(ValidatedInput, { field: model.longField }),
          //~ m('p', 'No more than 5 characters:'),
          //~ m(ValidatedInput, { field: model.shortField }),
          //~ m('hr'),
          //~ m('button[type=submit]', 'Validate')
        //~ )
      //~ )

    }
  }
}

var foorm = Form()

var Example = {
  view: function(vnode) {
    return m("div", "Hello")
  }
}

mount_graphic_eq(document.getElementById("equalizer"))


function mount_graphic_eq(e){ 
  m.mount(eqconfigel, {
    view: function () { return m(foorm) }
  })

  m.mount(equalel, {
    view: function () { return m( mc_eqlzr, {mdl:ceqmdl} ) }
  }) 
}
