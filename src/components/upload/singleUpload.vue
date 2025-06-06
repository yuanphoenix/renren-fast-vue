<template>
  <div>
    <el-upload
      action="#"
      :http-request="customUpload"
      :data="dataObj"
      list-type="picture"
      :multiple="false" :show-file-list="showFileList"
      :file-list="fileList"
      :before-upload="beforeUpload"
      :on-remove="handleRemove"
      :on-success="handleUploadSuccess"
      :on-preview="handlePreview">
      <el-button size="small" type="primary">点击上传</el-button>
      <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过10MB</div>
    </el-upload>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="fileList[0].url" alt="">
    </el-dialog>
  </div>
</template>
<script>
import {policy} from './policy'
import {getUUID} from '@/utils'

export default {
  name: 'singleUpload',
  props: {
    value: String
  },
  computed: {
    imageUrl () {
      return this.value
    },
    imageName () {
      if (this.value != null && this.value !== '') {
        return this.value.substr(this.value.lastIndexOf('/') + 1)
      } else {
        return null
      }
    },
    fileList () {
      return [{
        name: this.imageName,
        url: this.imageUrl
      }]
    },
    showFileList: {
      get: function () {
        return this.value !== null && this.value !== '' && this.value !== undefined
      },
      set: function (newValue) {
      }
    }
  },
  data () {
    return {
      dataObj: {
        policy: '',
        signature: '',
        key: '',
        ossaccessKeyId: '',
        dir: '',
        host: '',
        // callback:'',
      },
      dialogVisible: false
    }
  },
  methods: {

    customUpload (file) {
      const uploadHost = 'https://gulimall--tifa.oss-cn-beijing.aliyuncs.com'
      this.$http({
        url: this.$http.gulimalladornUrl('/oss/get_post_signature_for_oss_upload', 'gateway'),
        method: 'get'
      }).then(({data}) => {
        const objectKey = `${data.dir}${data.key}${file.file.name}`

        let formData = new FormData()
        formData.append('success_action_status', '200')
        formData.append('policy', data.policy)
        formData.append('x-oss-signature', data.signature)
        formData.append('x-oss-signature-version', 'OSS4-HMAC-SHA256')
        formData.append('x-oss-credential', data.x_oss_credential)
        formData.append('x-oss-date', data.x_oss_date)
        formData.append('key', objectKey) // 文件名
        formData.append('x-oss-security-token', data.security_token)
        formData.append('file', file.file) // file 必须为最后一个表单域

        fetch('https://gulimall--tifa.oss-cn-beijing.aliyuncs.com', {
          method: 'POST',
          body: formData
        }).then((response) => {
          console.log(response)
          if (response.status === 200) {
            this.$message({
              message: '上传成功',
              type: 'success',
              duration: 1500,
            })
            file.onSuccess(uploadHost + '/' + objectKey, file)
          } else {
            this.$message.error('上传失败')
          }
        })

      })

    },

    emitInput (val) {
      this.$emit('input', val)
    },
    handleRemove (file, fileList) {
      this.emitInput('')
    },
    handlePreview (file) {
      this.dialogVisible = true
    },
    beforeUpload (file) {

    },
    handleUploadSuccess (res, file) {
      console.log('上传成功...')
      this.showFileList = true
      this.fileList.pop()
      this.fileList.push({
        name: file.name,
        url: this.dataObj.host + '/' + this.dataObj.key.replace('${filename}', file.name)
      })
      this.emitInput(this.fileList[0].url)
    }
  }
}
</script>
<style>

</style>


