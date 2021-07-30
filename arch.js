arch={
  bells:[]
}

//halp
function makarr(n,f,th){
  var A= new Array(n) ; if(th) f=f.bind(th)
  for(var i=0;i<n;i++) A[i]=f(i) 
  return A
}

var EQspec

function setglobs(){
  EQspec=mdleqlzr(EQspec)
  frqs = EQspec.frqs
  pwrs = EQspec.pwrs
}

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
  
  return { 
     afreq:p.afreq
    ,efreq:p.efreq
    ,nfreq:p.nfreq
    ,linear:p.linear
    ,frqs:frq
    ,pwrs:pwr
    ,trillpow:p.trillpow
    ,trilltime:p.trilltime
    ,trillfreq:p.trillfreq
  }
}

function fixEQ(){
  
  if(!EQspec){
    EQspec = mdleqlzr({
      afreq:64
     ,efreq:16384
     ,nfreq:9
     ,linear:false
    },{} )
  }
  
  if(!EQspec.trilltime){
    EQspec.trillfreq=7.5;
    EQspec.trillpow=0.1;
    EQspec.trilltime=1;
  }
  
  console.log(EQspec)
}

var stowed=false
var storekey="audiocalibrate_storage"

//save da config
window.onbeforeunload = function (e) {
  if(stowed){
    console.log( "sot '"+JSON.stringify(EQspec)+"'" )
    stowed.setItem(storekey, JSON.stringify(EQspec) )
  }
}

function getstorage() {
  try {
    var x = '_teststring_' 
    stowed = window['localStorage']
    stowed.setItem(x, x); stowed.removeItem(x);
    return stowed
  }
  catch(e) { stowed=false; return false }
}

function readstored_eqconf(){
  stowed = getstorage()
  if( stowed ){
    var c=stowed.getItem(storekey)
    //~ console.log("b",c)
    if(c && c!=="undefined"){ return JSON.parse( c ) }
  }
}

fixEQ( readstored_eqconf() ) 

frqs = EQspec.frqs
pwrs = EQspec.pwrs

var cmin=0,cmax=100,volboost=0.01
var slength="2.75em",swide="16em"

function playztone(key){
  console.log("playang key",key,"frq",frqs[key],"pwr",pwrs[key])
  playonetrill(frqs[key],volboost*pwrs[key]/100, EQspec.trillfreq , EQspec.trillpow , EQspec.trilltime)
  
  var ccl=arch.bells[key].classList
  if(ccl.contains("pulse")){
    ccl.remove("pulse")
    ccl.add("pulse2")
  }else{
    ccl.remove("pulse2")
    ccl.add("pulse")
  }
}

//~ console.log(ceqmdl)

eqconfigel=document.getElementById("eqconfig")
equalel=document.getElementById("equalizer")
trillconfel=document.getElementById("trillconfig")

mount_graphic_eq(document.getElementById("equalizer"))

function mount_graphic_eq(e){ 
  m.mount(eqconfigel, {
    view: function () { return m(Eqconfiger,{mdl:EQspec}) }
  })

  m.mount(equalel, {
    view: function () { return m( mc_eqlzr, {mdl:EQspec} ) }
  })
  
  m.mount(trillconfel, {
    view: function () { return m( Trillconfiger, {mdl:EQspec} ) }
  }) 
}
