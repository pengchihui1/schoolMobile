const isDev = false
const path = isDev ? 'http://192.168.3.3:3000' : 'https://school-next.macau.school'

const url = {
  login: `${path}/school/mobile/login`,
  home: `${path}/school/mobile`
}

export default url