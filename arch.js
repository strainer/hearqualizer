
//helper in mithcomponents
function marray(n,f,th){
  var A= new Array(n) ; if(th) f=f.bind(th)
  for(var i=0;i<n;i++) A[i]=f(i) 
  return A
}

EQspec=[]

function setglobs(){
  EQspec=new_eqdat(EQspec)
}

function new_eqdat(p,r){
  
  var len=p.nfreq       //number frequencies

  var frq=new Array(len)
  var pwr=new Array(len)	
  
  var afreq=p.afreq     //anchor frequency
  var efreq=p.efreq     //end frequency
  
  var islinear=p.linear
  var afl=Math.log(afreq) , efl=Math.log(efreq)
  
  var linstep = (efreq-afreq)/(len-1)
  var logstep = (efl-afl)/(len-1)
    
  EQspec.pwrs=EQspec.pwrs||[]
  EQspec.frqs=EQspec.frqs||[]
  
  for(var i=0;i<len;i++){
    var cf = islinear ? afreq + i*linstep 
                     : Math.pow(Math.E, afl + logstep*i )
                     
    frq[i]=Math.round(cf)
    pwr[i]=(adj_eq(frq[i])*100) || 80
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
    EQspec = new_eqdat({
      afreq:128
     ,efreq:11585
     ,nfreq:14
     ,linear:false
    },{} )
  }
  
  if(!EQspec.trilltime){
    EQspec.trillfreq=7.5;
    EQspec.trillpow=0.1;
    EQspec.trilltime=1;
  }
  
  //console.log(EQspec)
}

var stowed=false
var storekey="hearqualizer_config2"

//save da config
window.onbeforeunload = function (e) {
  if(stowed){
    console.log( "sot '"+JSON.stringify(EQspec)+"'" )
    stowed.setItem(storekey, JSON.stringify(EQspec) )
  }
}

function getstorage() {
  try {
    var x = '_test_store_active_' 
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

EQspec=readstored_eqconf()

fixEQ( EQspec ) 

var cmin=0,cmax=100,volboost=0.01
var slength="2.75em",swide="16em"
var fdr=Fdrandom.pot()


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
