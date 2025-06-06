<template>
  <div>
    <el-upload
      action="#"
      :http-request="customUpload"
      :data="dataObj"
      :list-type="listType"
      :file-list="fileList"
      :before-upload="beforeUpload"
      :on-remove="handleRemove"
      :on-success="handleUploadSuccess"
      :on-preview="handlePreview"
      :limit="maxCount"
      :on-exceed="handleExceed"
      :show-file-list="showFile"
    >
      <i class="el-icon-plus"></i>
    </el-upload>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt/>
    </el-dialog>
  </div>
</template>
<script>
import {policy} from './policy'
import {getUUID} from '@/utils'
import fi from 'element-ui/src/locale/lang/fi'

export default {
  name: 'multiUpload',
  props: {
    //图片属性数组
    value: Array,
    //最大上传图片数量
    maxCount: {
      type: Number,
      default: 30
    },
    listType: {
      type: String,
      default: 'picture-card'
    },
    showFile: {
      type: Boolean,
      default: true
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
        uuid: ''
      },
      dialogVisible: false,
      dialogImageUrl: null
    }
  },
  computed: {
    fileList () {
      let fileList = []
      for (let i = 0; i < this.value.length; i++) {
        fileList.push({url: this.value[i]})
      }

      return fileList
    }
  },
  mounted () {
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
            file.onSuccess(uploadHost + "/" + objectKey, file);
          } else {
            this.$message.error('上传失败')
          }
        })

      })

    },

    emitInput (fileList) {
      let value = []
      for (let i = 0; i < fileList.length; i++) {
        console.log('发送', fileList[i].url)
        value.push(fileList[i].url)
      }
      this.$emit('input', value)
    },
    handleRemove (file, fileList) {
      this.emitInput(fileList)
    },
    handlePreview (file) {
      this.dialogVisible = true
      this.dialogImageUrl = file.url
    },
    beforeUpload (file) {
      console.log(file)
    },
    handleUploadSuccess (res, file) {
      console.log('上传成功resd打印', res)
      console.log('上传成功', file.name)
      this.fileList.push({
        name: file.name,
        // url: this.dataObj.host + "/" + this.dataObj.dir + "/" + file.name； 替换${filename}为真正的文件名
        url: res
      })
      this.emitInput(this.fileList)
    },
    handleExceed (files, fileList) {
      this.$message({
        message: '最多只能上传' + this.maxCount + '张图片',
        type: 'warning',
        duration: 1000
      })
    }
  }
}
</script>
<style>
</style>


