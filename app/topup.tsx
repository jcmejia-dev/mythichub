import React,{useEffect,useState} from 'react';
import {ActivityIndicator,Platform,ScrollView,Text,TextInput,TouchableOpacity,View,useWindowDimensions} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {Ionicons} from '@expo/vector-icons';
import {router} from 'expo-router';

const C={bg:'#070A10',panel:'#101622',panel2:'#1B2333',stroke:'#3B4559',gold:'#F6C75D',violet:'#A25AFF',cyan:'#4CE5EF',white:'#F6F8FC',muted:'#A5B1C7',green:'#7FE6B6'};
const API=process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/,'');
const packages=[
 {id:'weekly',name:'Weekly Diamond Pass',detail:'Plan for a recurring in-game pass',icon:'calendar-outline' as const},
 {id:'small',name:'Small diamond package',detail:'Occasional top-ups and event goals',icon:'diamond-outline' as const},
 {id:'medium',name:'Medium diamond package',detail:'Plan a larger Diamond Vault contribution',icon:'sparkles-outline' as const},
 {id:'large',name:'Large diamond package',detail:'For bigger long-term purchases',icon:'layers-outline' as const},
];
const textStyle=(size=14,color=C.white,weight:'400'|'600'|'700'|'800'|'900'='400')=>({fontSize:size,color,fontWeight:weight} as const);
function Input({label,placeholder,value,set}: {label:string;placeholder:string;value:string;set:(v:string)=>void}){
 return <View style={{marginTop:14}}><Text style={{...textStyle(11,C.muted,'800'),letterSpacing:1}}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={set} placeholder={placeholder} placeholderTextColor="#8190A5" keyboardType="decimal-pad" style={{color:C.white,backgroundColor:C.panel2,borderColor:C.stroke,borderWidth:1,borderRadius:4,padding:14,marginTop:7}}/></View>;
}
export default function TopUp(){
 const {width}=useWindowDimensions(),wide=width>=900;
 const [playerId,setPlayerId]=useState(''),[zoneId,setZoneId]=useState(''),[savedNickname,setSavedNickname]=useState('');
 const [selected,setSelected]=useState<string|null>(null),[loadingProfile,setLoadingProfile]=useState(true);
 const [supplierCost,setSupplierCost]=useState(''),[competitorPrice,setCompetitorPrice]=useState(''),[fee,setFee]=useState(''),[margin,setMargin]=useState('5');
 const cost=Number(supplierCost),competitor=Number(competitorPrice),fees=Number(fee)||0,target=Number(margin)||0;
 const validCost=supplierCost.trim()!==''&&Number.isFinite(cost)&&cost>=0;
 const validCompetitor=competitorPrice.trim()!==''&&Number.isFinite(competitor)&&competitor>0;
 const validFees=Number.isFinite(fees)&&fees>=0&&Number.isFinite(target)&&target>=0;
 const retail=validCost&&validFees?Math.ceil((cost+fees+target)*100)/100:null;
 const competitive=retail!==null&&validCompetitor&&retail<competitor;
 const panel=(extra:object={})=>({backgroundColor:C.panel,borderWidth:1,borderColor:C.stroke,borderRadius:4,padding:20,...extra});
 useEffect(()=>{let active=true;(async()=>{
  if(!API){if(active)setLoadingProfile(false);return}
  try{
   const token=Platform.OS==='web'?null:await SecureStore.getItemAsync('mythichub_auth_token');
   const response=await fetch(API+'/api/profile',{headers:token?{Authorization:'Bearer '+token}:{},credentials:Platform.OS==='web'?'include':'omit'});
   if(!response.ok)return;
   const data=await response.json();
   if(active&&data?.profile){setPlayerId(data.profile.playerId??'');setZoneId(data.profile.serverId??'');setSavedNickname(data.profile.nickname??'');}
  }catch{}finally{if(active)setLoadingProfile(false)}
 })();return()=>{active=false};},[]);
 return <ScrollView style={{flex:1,backgroundColor:C.bg}} contentContainerStyle={{paddingBottom:65}}>
  <View style={{height:4,backgroundColor:C.violet}}><View style={{height:4,width:'32%',backgroundColor:C.gold}}/></View>
  <View style={{width:'100%',maxWidth:1100,alignSelf:'center',paddingHorizontal:wide?28:16,paddingTop:26}}>
   <TouchableOpacity accessibilityRole="button" onPress={()=>router.replace('/')} style={{alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:9,paddingVertical:12}}>
    <Ionicons name="arrow-back-outline" size={18} color={C.cyan}/><Text style={textStyle(13,C.cyan,'800')}>Back to gaming hub</Text>
   </TouchableOpacity>
   <View style={{...panel({backgroundColor:'#1A1531',borderColor:C.violet,padding:wide?28:19}),marginTop:15}}>
    <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
     <Ionicons name="diamond-outline" size={34} color={C.gold}/><View><Text style={{...textStyle(10,C.gold,'800'),letterSpacing:1.8}}>MYTHICHUB • DIAMOND VAULT</Text><Text style={{...textStyle(wide?29:24,C.white,'900'),marginTop:6}}>Top-Up Store & Price Planner</Text></View>
    </View>
    <Text style={{...textStyle(13,C.muted),marginTop:13,lineHeight:22}}>Select a planned package, reuse your saved MLBB ID and calculate sustainable selling prices in Philippine pesos. Orders, payments and deliveries are not enabled.</Text>
    <View style={{backgroundColor:'#31261D',borderColor:'#A38745',borderWidth:1,borderRadius:4,padding:14,marginTop:18}}>
     <Text style={textStyle(12,C.gold,'900')}>● PLANNING MODE — CHECKOUT DISABLED</Text>
     <Text style={{...textStyle(12,'#E6DBBE'),marginTop:7,lineHeight:20}}>Product names are placeholders, not a live supplier catalogue. No funds are accepted or charged. Verify supplier authorization and pricing before launch.</Text>
    </View>
   </View>
   <Text style={{...textStyle(21,C.white,'900'),marginTop:28,marginBottom:12}}>Choose your package</Text>
   <View style={{flexDirection:'row',flexWrap:'wrap',gap:12}}>
    {packages.map(p=><TouchableOpacity key={p.id} onPress={()=>setSelected(p.id)} accessibilityRole="button" accessibilityState={{selected:selected===p.id}} style={{...panel({flexGrow:1,flexBasis:wide?'45%':'100%',minWidth:wide?330:240}),borderColor:selected===p.id?C.violet:C.stroke,borderTopWidth:3,borderTopColor:selected===p.id?C.cyan:C.gold}}>
     <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10}}><Ionicons name={p.icon} color={selected===p.id?C.cyan:C.gold} size={26}/><Text style={textStyle(10,selected===p.id?C.cyan:C.muted,'800')}>{selected===p.id?'SELECTED':'PLANNING ONLY'}</Text></View>
     <Text style={{...textStyle(16,C.white,'900'),marginTop:14}}>{p.name}</Text>
     <Text style={{...textStyle(12,C.muted),marginTop:7}}>{p.detail}</Text>
     <Text style={{...textStyle(11,C.gold,'800'),marginTop:11}}>Price pending provider catalogue</Text>
    </TouchableOpacity>)}
   </View>
   <View style={{flexDirection:wide?'row':'column',gap:16,marginTop:25}}>
    <View style={panel({flex:1})}>
     <Text style={textStyle(19,C.white,'900')}>Player details</Text>
     <Text style={{...textStyle(12,C.muted),marginTop:8,lineHeight:20}}>Your saved player identifiers can be prefilled from your private account. No game password is needed.</Text>
     {loadingProfile?<ActivityIndicator color={C.violet} style={{marginTop:14}}/>:savedNickname?<Text style={{...textStyle(13,C.green,'800'),marginTop:12}}>Saved nickname: {savedNickname}</Text>:null}
     <Input label="MLBB PLAYER ID" placeholder="Player ID" value={playerId} set={setPlayerId}/>
     <Input label="ZONE / SERVER ID" placeholder="Zone ID" value={zoneId} set={setZoneId}/>
     <Text style={{...textStyle(11,C.muted),marginTop:13,lineHeight:18}}>Only your verified supplier can confirm valid top-up destinations. Nickname lookup alone does not prove game-account ownership.</Text>
    </View>
    <View style={panel({flex:1})}>
     <Text style={textStyle(19,C.white,'900')}>Price calculator</Text>
     <Text style={{...textStyle(12,C.muted),marginTop:8,lineHeight:20}}>Enter your supplier quote and operating costs. All amounts below are entered manually, not fetched from Distribution Hub.</Text>
     <Input label="SUPPLIER COST (PHP)" placeholder="e.g. 100" value={supplierCost} set={setSupplierCost}/>
     <Input label="OTHER FEES (PHP)" placeholder="e.g. 5" value={fee} set={setFee}/>
     <Input label="TARGET PROFIT (PHP)" placeholder="e.g. 10" value={margin} set={setMargin}/>
     <Input label="COMPETITOR PRICE (PHP)" placeholder="Optional" value={competitorPrice} set={setCompetitorPrice}/>
    </View>
   </View>
   <View style={panel({marginTop:16,borderColor:C.gold})}>
    <Text style={textStyle(12,C.muted,'800')}>PLANNED MINIMUM RETAIL PRICE</Text>
    <Text style={{...textStyle(30,C.gold,'900'),marginTop:10}}>{retail===null?'Enter valid supplier costs':'₱'+retail.toFixed(2)}</Text>
    {retail!==null&&validCompetitor?<Text style={{...textStyle(12,competitive?C.green:'#FFB1AB'),marginTop:9}}>{competitive?'Below your manually entered competitor price by ₱'+(competitor-retail).toFixed(2):'Cannot undercut that competitor while keeping the requested margin.'}</Text>:null}
    <TouchableOpacity disabled accessibilityRole="button" style={{backgroundColor:'#394256',marginTop:20,padding:16,borderRadius:4,alignItems:'center'}}><Text style={textStyle(13,'#CBD0DC','900')}>Orders and checkout are not available</Text></TouchableOpacity>
   </View>
   <Text style={{...textStyle(11,C.muted),textAlign:'center',marginTop:25,lineHeight:19}}>MYTHICHUB • Independent gaming companion • Not affiliated with MOONTON</Text>
  </View>
 </ScrollView>;
}
