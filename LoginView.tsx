
import React, {useState, type PropsWithChildren} from 'react';
import {ActivityIndicator, Alert, Image,Modal,PermissionsAndroid,Platform,SafeAreaView,ScrollView, Text,TouchableOpacity,View} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import {Card, TextInput,Button, Appbar, Menu, Divider, Snackbar} from 'react-native-paper';
import { loginStyle } from './LoginStyle';
import LocalInfo from 'react-native-sensitive-info';
import {useTranslation} from 'react-i18next';
import RNRestart from 'react-native-restart';
import RNFetchBlob from 'rn-fetch-blob';
import FileViewer from 'react-native-file-viewer';
import LottieView from 'lottie-react-native';
import { fileUrl,apiGenerale } from '../../components/api/url';
interface UserLoginViewProps{
  navigation:any;
}

const UserLoginView =  (props:UserLoginViewProps) => {
    const fileUrlConfidentiality = fileUrl("documents/politique confidentialite","politique de confidentialite.pdf");
    const fileUrlMentionLegale = fileUrl("documents/mention legale","mentions legales.pdf");
    const [modalTraitementVisible, setModalTraitementVisible] = useState(false);
    const [modalmsgTraitementVisible, setModalmsgTraitementVisible] = useState("");
    const [snackinfovisible, setSnackinfovisible] = useState(false);
    const [snackFixevisible, setSnackFixevisible] = useState(false);
    const [msg_snackbar, setMsg_snackbar] = useState("");
    const [langvalue, setLang] = useState('fr'); 
    const savingLangData = LocalInfo.setItem("lang", langvalue, {
        sharedPreferencesName: "storageGenerale",
        keychainService: "storageGenerale",
    });   
    const [modalVisible, setModalVisible] = useState(false);
    const {t,i18n}=useTranslation(); 
    const data = [
        { label:t('french'), value: 'fr' },
        { label:t('english'), value: 'en' },
        { label:t('espagnol'), value: 'es' },
        { label:t('neerlandais'), value: 'nl' }
    ];  
    const [isFocus, setIsFocus] = useState(false); 
    const [error, setError] = useState("");
    const [errorEmail, setErrorEmail] = useState("");
    const [errorPassword, setErrorPassword] = useState("");  
    const [loginInfo, setLoginInfo] = useState({email:"",password:""}); 
    const {email,password} = loginInfo; 

    const changeLang = async (lang: string)=>{

        setLang(lang);
        i18n.changeLanguage(lang);
        const savingLangData = await LocalInfo.setItem("lang", lang, {

            sharedPreferencesName: "storageGenerale",
            keychainService: "storageGenerale",

        });
       /* if (lang==="4") {
            const gettingAllKeys = await LocalInfo.getAllItems({
              sharedPreferencesName: "storageGenerale",
              keychainService: "storageGenerale",
            });      
        }*/
        setVisible(false);
    }
    const changeInputLogin = (value: any,field: string)=>{

        setLoginInfo({...loginInfo,[field]:value})
        if (field==="email") {

            updateError("",setErrorEmail)
        }
        if (field==="password") {

            updateError("",setErrorPassword)
        }
        updateError("",setError);

    }
    const validationLogin=(obje:{email:string ,password:string})=>{

        return Object.values(obje).every(value=>value.trim());

    }
    const updateError=(eror: any, nameError: (arg0: any) => void)=>{

        nameError(eror);

    }
    /*const renderLabel = () => {
      if (value || isFocus) {
        return (
          <Text style={[styles.label, isFocus && { color: 'blue' }]}>
            Dropdown label
          </Text>
        );
      }
      return null;
    };*/

    /**
     * Traitement et controle accès de l'utilisateur
     * @author Bruce
     * @version 1
     */
    const login = ()=>{

      if (validationLogin(loginInfo)) { 

        setModalVisible(true);      
        return fetch(apiGenerale("MobileUserController","login"), {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: loginInfo.email,
                password: loginInfo.password
          })
        })
        .then((response) => response.json())
        .then(async (json) => {
            //return json.movies;
            if (json.status=="incorrect") {
                setModalVisible(false);
                
                setError("incorrect");
            }else{
                if (json.status=="non actif") {
                    setModalVisible(false);            
                    setError("non actif");
                }else{ 

                    setError("");
                    const savingIdData = await LocalInfo.setItem("userId", json.id, {
                        sharedPreferencesName: "storageGenerale",
                        keychainService: "storageGenerale",
                    });
                    /*const savingLangData = await LocalInfo.setItem("lang", "langvalue", {
                        sharedPreferencesName: "storageGenerale",
                        keychainService: "storageGenerale", 
                    });*/
                    setModalVisible(false);
                    // props.navigation.navigate("Home");
                    console.log("ok");
                }
            }
        })
        .catch((error) => {
            //console.error(error);
            setModalVisible(false);
            setSnackFixevisible(true) ;
			setMsg_snackbar("fetch_error");
        });
      }else{
        if (!email.trim()) {
            updateError("errorEmail",setErrorEmail)
        }else{
            updateError("",setErrorEmail)
        }
        if (!password.trim()) {          
            updateError("errorPassword",setErrorPassword)
        }else{
            updateError("",setErrorPassword)
        }
      }
    }
    const [visible, setVisible] = React.useState(false);
    const openMenu = () => setVisible(true);

    const closeMenu = () => setVisible(false);
    const inscription=()=>props.navigation.navigate("Inscription");
    const forgote = ()=>{props.navigation.navigate("ResetMdp");}
    const clickConfidentiality = async () => {
	
		if (Platform.OS === 'ios') {

		    downloadFileconfidente();

		} else {

            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: t('storage_permission'),
                        message:t('storage_permission_message'),
                        //buttonNeutral: "Ask Me Later",
                        //buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                console.log(PermissionsAndroid.RESULTS);
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    // Start downloading
                    downloadFileconfidente();
                } else {
                    // If permission denied then show alert
                     Alert.alert(t('error'),t('storage_permission_message_result'));
                }
            } catch (err) {
                    // To handle permission related exception
                    console.log("++++"+err);
            }
		}
	};
    const clickMentionlegale = async () => {
	
		if (Platform.OS === 'ios') {

		    downloadFileMentionlegale();

		} else {

            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: t('storage_permission'),
                        message:t('storage_permission_message'),
                        //buttonNeutral: "Ask Me Later",
                        //buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    // Start downloading
                    downloadFileMentionlegale();
                } else {
                    // If permission denied then show alert
                     Alert.alert(t('error'),t('storage_permission_message_result'));
                }
            } catch (err) {
                    // To handle permission related exception
                    console.log("++++"+err);
            }
		}
	};
    const downloadFileconfidente = () => {
   
		setModalTraitementVisible(true); 
		setModalmsgTraitementVisible("telechargement_encours");
		let date = new Date();
		let FILE_URL = fileUrlConfidentiality;    
		let file = getFileExtention(FILE_URL);
		let file_ext = "";
		if (Array.isArray(file)) {      
			file_ext = '.' + file[0];
		}
		
		const { config, fs } = RNFetchBlob;
		let RootDir = Platform.OS === 'ios' ? fs.dirs.DocumentDir : fs.dirs.DownloadDir;
		let filedir=RootDir+
		'/Privacy_policy' + 
		Math.floor(date.getTime() + date.getSeconds() / 2) +
		file_ext;
        //config(options)
	    RNFetchBlob.config({

		    fileCache:true, 
		    path:filedir,

	    }).fetch('GET', FILE_URL)
        .then(res => {
			
			let state = String(res.respInfo.status);

			if (state=="200") { 

				setModalTraitementVisible(false); 
				setModalmsgTraitementVisible("");		  
				setMsg_snackbar("telechargement_termine");
				//setSnackinfovisible(true);
				//console.log(filedir);
				const path = FileViewer.open(filedir,{ showOpenWithDialog: true })
				.then(() => {
					console.log('Success');

				}).catch((error) => {                    
					console.log(error);
				});
            //RNFetchBlob.android.actionViewIntent(res.path(),"application/pdf");
			}else{
				setModalTraitementVisible(false);
				setModalmsgTraitementVisible("");
				setSnackFixevisible(true) ;
				setMsg_snackbar("fetch_error"); 
			}
	  
        }).catch((error) => {
			
			setModalTraitementVisible(false);
			setModalmsgTraitementVisible("");
			setSnackFixevisible(true) ;
			setMsg_snackbar("fetch_error");

		});
    };
    const downloadFileMentionlegale = () => {
   
		setModalTraitementVisible(true); 
		setModalmsgTraitementVisible("telechargement_encours");
		let date = new Date();
		let FILE_URL = fileUrlMentionLegale;    
		let file = getFileExtention(FILE_URL);
		let file_ext = "";
		if (Array.isArray(file)) {      
			file_ext = '.' + file[0];
		}
		
		const { config, fs } = RNFetchBlob;
		let RootDir = Platform.OS === 'ios' ? fs.dirs.DocumentDir : fs.dirs.DownloadDir;
		let filedir=RootDir+
		'/Legal_notice' + 
		Math.floor(date.getTime() + date.getSeconds() / 2) +
		file_ext;
        //config(options)
	    RNFetchBlob.config({
		    fileCache:true, 
		    path:filedir,
	    }).fetch('GET', FILE_URL)
        .then(res => {

			let state = String(res.respInfo.status);

			if (state=="200") {  

				setModalTraitementVisible(false); 
				setModalmsgTraitementVisible("");		  
				setMsg_snackbar("telechargement_termine");
				//setSnackinfovisible(true);
				
				const path = FileViewer.open(filedir,{ showOpenWithDialog: true })
				.then(() => {
					console.log('Success');
				}).catch((error) => {
					console.log(error);
				});
            //RNFetchBlob.android.actionViewIntent(res.path(),"application/pdf");
			}else{

				setModalTraitementVisible(false);
				setModalmsgTraitementVisible("");
				setSnackFixevisible(true) ;
				setMsg_snackbar("fetch_error"); 

			}
	  
        }).catch((error) => {
			
			setModalTraitementVisible(false);
			setModalmsgTraitementVisible("");
			setSnackFixevisible(true) ;
			setMsg_snackbar("fetch_error"); 
		});
    };
    const getFileExtention = (fileUrlConfidentiality: any) => {
        // To get the file extension
        return /[.]/.exec(fileUrlConfidentiality) ?
                 /[^.]+$/.exec(fileUrlConfidentiality) : undefined;
    };
    return(
      <SafeAreaView style={loginStyle.entete}>
        <Appbar>          
              
            <Appbar.Content title=""/>  
                <Menu visible={visible} onDismiss={closeMenu} anchor={ 
                    <View style={{paddingRight:5}}>
                        <TouchableOpacity onPress={openMenu}>{ (langvalue=="fr")? 
                            <Image source={require('../../assets/image/fr.png')} style={loginStyle.logo_lang} /> : (langvalue=="en")?
                            <Image source={require('../../assets/image/us.png')} style={loginStyle.logo_lang} />: (langvalue=="es")?
                            <Image source={require('../../assets/image/es.png')} style={loginStyle.logo_lang}/>: 
                            <Image source={require('../../assets/image/nl.png')} style={loginStyle.logo_lang}/>}
                        </TouchableOpacity>
                    </View> }>                    
                
                    <Menu.Item onPress={() => changeLang('fr')} title={t('french')} />
                    <Divider />
                    <Menu.Item onPress={() =>changeLang('en')} title={t('english')}/>
                    <Divider />
                    <Menu.Item onPress={() => changeLang('es')} title={t('espagnol')} />
                    <Divider />
                    <Menu.Item onPress={() => changeLang('nl')} title={t('neerlandais')} />
                </Menu>
            
        </Appbar>
          <View style={loginStyle.content}>        
            <View style={loginStyle.view}>
              <Card style={{elevation:0}}> 
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Card.Content >
                    <View style={{justifyContent: 'center', alignItems: "center"}}>
                      <Image source={require('../../assets/logo.png')} style={loginStyle.logo_login}/>              
                    </View> 
                    {
                      (error==="incorrect")? <Text style={{color:"red"}}>Login and password incorrect</Text>
                      :(error==="non actif")? <Text style={{color:"red"}}>Compte inactif</Text> : null  
                    }
                    {
                      (errorEmail!="")? <Text style={{color:"red",fontSize:10}}>{t('champ_vide')}</Text>
                      :null  
                    }
                    <TextInput mode='flat' value={email} onChangeText={(value)=>changeInputLogin(value,"email")} placeholder={t('email')} placeholderTextColor="#8d8f8f" keyboardType="email-address" autoCapitalize='none'/>
                    {
                      (errorPassword!="")? <Text style={{color:"red",fontSize:10}}>{t('champ_vide')}</Text>
                      :null  
                    }
                    <TextInput mode='flat' value={password} onChangeText={(value)=>changeInputLogin(value,"password")} placeholder={t('password')} placeholderTextColor="#8d8f8f" secureTextEntry={true}/> 
                    <Text style={{width:"100%"}}></Text>  
                    <Button mode="contained" onPress={login} >{t('login')}</Button> 
                    <Text style={{width:"100%"}}></Text>              
                  </Card.Content>
                    <TouchableOpacity onPress={()=>forgote()}>
                      <View style={{flexDirection:"row"}}>
                        <Text style={{fontSize:12}}>{t('forgot_password1')}</Text>
                        <Text style={loginStyle.textcliquable}>{t('forgot_password2')}</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>inscription()}>
                      <Text style={loginStyle.textcliquable}>{t('cliqueinscription')}</Text>
                    </TouchableOpacity> 
                </ScrollView> 
              </Card>
          </View>  
        </View>           
        <View style={loginStyle.footer}>
          <TouchableOpacity onPress={clickConfidentiality}>
            <Text style={loginStyle.textcliquable}>{t('privacy_policy')}</Text>
          </TouchableOpacity>
          <Text style={loginStyle.textcliquable}>  -  </Text>
          <TouchableOpacity onPress={clickMentionlegale}>
            <Text style={loginStyle.textcliquable}>{t('legal_notice')}</Text>
          </TouchableOpacity>
        </View>
        <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
             // Alert.alert("Modal has been closed.");
              setModalVisible(!modalVisible);
            }}
            style={loginStyle.modal}>
            <View style={loginStyle.contenu}>
            <LottieView
                autoPlay
                style={loginStyle.loading}
                source={require('../../assets/loading/loading2.json')}
            />
            </View>
        </Modal>
        <Modal
                animationType="slide"
                transparent={true}
                visible={modalTraitementVisible}
                //visible={true}
                /*onRequestClose={() => {
                // Alert.alert("Modal has been closed.");
                setModalTraitementVisible(!modalTraitementVisible);
                }}*/
                >
                <View style={loginStyle.modalcontenu}> 
					<View style={loginStyle.modalcontenu2}>
						<View style={{margin:20}}>
                        <LottieView
                            autoPlay
                            style={loginStyle.loading}
                            source={require('../../assets/loading/loading2.json')}
                        />
                    	<Text style={{color:"white"}}>{t(modalmsgTraitementVisible)}</Text>
                    	

						</View>
					</View>                   
                </View>
        </Modal>
        <Snackbar
            visible={snackinfovisible}
            onDismiss={() => {}}
			//duration={2000}
			action={{
				label: t("fermer"),
				onPress: () => {
					setSnackinfovisible(false);
					},
			}}
            
            style={{backgroundColor:"rgba(15, 15, 15,1)",borderWidth:1,borderColor:"rgba(99, 230, 138,1)"}}
            >
            <Text style={{color:"rgba(99, 230, 138,1)"}}>{t(msg_snackbar)}</Text>
        </Snackbar>
            <Snackbar
                visible={snackFixevisible}
                onDismiss={() => {}}
                action={{
                    label: t("fermer"),
                    onPress: () => {
                        setSnackFixevisible(false);
                        },
                }}
            
                style={{backgroundColor:"rgba(15, 15, 15,1)",borderWidth:1,borderColor:"red"}}
                >
                <Text style={{color:"red"}}>{t(msg_snackbar)}</Text>
            </Snackbar> 
      </SafeAreaView>
    );
};
export default UserLoginView;