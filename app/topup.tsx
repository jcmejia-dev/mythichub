import React,{useState} from 'react';
import {ScrollView,Text,TextInput,TouchableOpacity,View} from 'react-native';
import {router} from 'expo-router';

const bg='#0B1224',panel='#17253E',gold='#EAC67D',muted='#AAB9CE';
const packages=[{id:'weekly',name:'Weekly Diamond Pass',detail:'Subscription-style in-game pass'},{id:'small',name:'Small diamond package',detail:'For occasional purchases'},{id:'medium',name:'Medium diamond package',detail:'For regular players'},{id:'large',name:'Large diamond package',detail:'For bigger purchases'}];
export default function TopUp(){
 const [playerId,setPlayerId]=useState(''),[zoneId,setZoneId]=useState(''),[selected,setSelected]=useState<string|null>(null);
 const [supplierCost,setSupplierCost]=useState(''),[competitorPrice,setCompetitorPrice]=useState(''),[fee,setFee]=useState(''),[margin,setMargin]=useState('5');
 const cost=Number(supplierCost),competitor=Number(competitorPrice),fees=Number(fee)||0,target=Number(margin)||0;
 const validCost=supplierCost.trim()!==''&&Number.isFinite(cost)&&cost>=0;
 const validCompetitor=competitorPrice.trim()!==''&&Number.isFinite(competitor)&&competitor>0;
 const retail=validCost?Math.ceil((cost+fees+target)*100)/100:null;
 const competitive=retail!==null&&validCompetitor&&retail<competitor;
 const input=(placeholder:string,value:string,set:(v:string)=>void)=><TextInput value={value} onChangeText={set} placeholder={placeholder} placeholderTextColor="#8190A5" keyboardType="decimal-pad" style={{color:'#fff',backgroundColor:panel,borderColor:'#30405B',borderWidth:1,borderRadius:12,padding:14,marginTop:8}}/>;
 return <ScrollView style={{flex:1,backgroundColor:bg}} contentContainerStyle={{padding:22,paddingTop:60,paddingBottom:55}}>
  <TouchableOpacity onPress={()=>router.back()}><Text style={{color:gold,fontWeight:'700'}}>‹ Back to MythicHub</Text></TouchableOpacity>
  <Text style={{color:gold,fontSize:27,fontWeight:'900',marginTop:24}}>✦ TOP-UP STORE</Text>
  <Text style={{color:muted,marginTop:8,lineHeight:21}}>Competitive MLBB diamond top-ups, powered by verified supplier pricing.</Text>
  <View style={{borderColor:'#775B25',borderWidth:1,borderRadius:14,padding:14,marginTop:20,backgroundColor:'#2B261C'}}>
   <Text style={{color:gold,fontWeight:'800'}}>COMING SOON · CHECKOUT DISABLED</Text>
   <Text style={{color:'#E6DBBE',marginTop:7,lineHeight:20}}>No payments or diamond deliveries are available yet. Supplier integration, pricing, and fulfillment must be verified before launch.</Text>
  </View>
  <Text style={{color:'#fff',fontWeight:'800',fontSize:20,marginTop:28}}>Choose a package</Text>
  {packages.map(p=><TouchableOpacity key={p.id} onPress={()=>setSelected(p.id)} style={{padding:16,marginTop:11,borderRadius:14,backgroundColor:panel,borderWidth:1,borderColor:selected===p.id?gold:'#30405B'}}>
   <Text style={{color:'#fff',fontWeight:'800'}}>{p.name}</Text><Text style={{color:muted,marginTop:4}}>{p.detail}</Text><Text style={{color:gold,marginTop:7}}>Price pending supplier confirmation</Text>
  </TouchableOpacity>)}
  <Text style={{color:'#fff',fontWeight:'800',fontSize:20,marginTop:28}}>Player details</Text>
  <Text style={{color:muted,marginTop:6}}>Only enter IDs. Never share your MLBB password or verification codes.</Text>
  {input('MLBB Player ID',playerId,setPlayerId)}{input('Server / Zone ID',zoneId,setZoneId)}
  <Text style={{color:'#fff',fontWeight:'800',fontSize:20,marginTop:30}}>Price calculator (planning only)</Text>
  <Text style={{color:muted,marginTop:7,lineHeight:20}}>Use actual supplier quotes and competitor prices to determine whether a profitable lower price is possible. Values below are not live quotes.</Text>
  {input('Supplier cost (PHP)',supplierCost,setSupplierCost)}
  {input('Payment and other fees (PHP)',fee,setFee)}
  {input('Minimum profit per order (PHP)',margin,setMargin)}
  {input('Competitor retail price (PHP)',competitorPrice,setCompetitorPrice)}
  <View style={{backgroundColor:panel,borderRadius:14,padding:17,marginTop:15}}>
   <Text style={{color:muted}}>Minimum sustainable selling price</Text>
   <Text style={{color:gold,fontWeight:'900',fontSize:26,marginTop:5}}>{retail===null?'Enter supplier cost':'₱'+retail.toFixed(2)}</Text>
   {retail!==null&&validCompetitor?<Text style={{color:competitive?'#83E0B3':'#F4B7A8',marginTop:9}}>{competitive?'Below the entered competitor price by ₱'+(competitor-retail).toFixed(2):'Cannot undercut this competitor while meeting the entered margin.'}</Text>:null}
  </View>
  <TouchableOpacity disabled style={{backgroundColor:'#3A4352',borderRadius:13,padding:17,marginTop:23,alignItems:'center'}}><Text style={{color:'#D0D6DF',fontWeight:'800'}}>Checkout unavailable until launch</Text></TouchableOpacity>
  <Text style={{color:muted,fontSize:12,marginTop:13,lineHeight:19}}>MythicHub is an independent community project and is not affiliated with Moonton. Package availability and resale permissions require supplier confirmation.</Text>
 </ScrollView>
}
